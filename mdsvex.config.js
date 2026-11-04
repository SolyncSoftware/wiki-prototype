import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdsvex } from 'mdsvex';
import remarkFootnotes from 'remark-footnotes';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const articleLayout = path.join(dirname, 'src/lib/components/articles/ArticleLayout.svelte');

function extractKramdownAttributes(node) {
	if (node.type !== 'paragraph') return undefined;
	const text = node.children.at(-1);
	if (!text || text.type !== 'text') return undefined;

	const match = text.value.match(/(?:^|\n)\{:\s*([^}]*)\}\s*$/);
	if (!match) return undefined;

	const standalone = node.children.length === 1 && text.value.slice(0, match.index).trim() === '';
	text.value = text.value.slice(0, match.index).trimEnd();

	return {
		attributes: {
			classes: [...match[1].matchAll(/\.([A-Za-z0-9_-]+)/g)].map(([, className]) => className),
			id: match[1].match(/#([A-Za-z0-9_-]+)/)?.[1]
		},
		standalone
	};
}

function addKramdownAttributes(node, attributes) {
	node.data ??= {};
	node.data.hProperties ??= {};

	if (attributes.classes.length > 0) {
		const existing = node.data.hProperties.className ?? [];
		node.data.hProperties.className = [
			...(Array.isArray(existing) ? existing : [existing]),
			...attributes.classes
		];
	}
	if (attributes.id) node.data.hProperties.id = attributes.id;
}

function remarkKramdownAttributes() {
	return (tree) => {
		const processChildren = (parent) => {
			if (!parent.children) return;

			for (let index = 0; index < parent.children.length; index += 1) {
				const node = parent.children[index];
				if (node.type === 'blockquote') {
					const lastChild = node.children.at(-1);
					const extracted = lastChild && extractKramdownAttributes(lastChild);
					if (extracted) {
						if (extracted.standalone) node.children.pop();
						addKramdownAttributes(node, extracted.attributes);
					}
				} else {
					const extracted = extractKramdownAttributes(node);
					if (extracted) {
						if (extracted.standalone) {
							if (index > 0) {
								addKramdownAttributes(parent.children[index - 1], extracted.attributes);
							}
							parent.children.splice(index, 1);
							index -= 1;
							continue;
						}
						addKramdownAttributes(node, extracted.attributes);
					}
				}

				if (node.type === 'text' && /[{}]/.test(node.value)) {
					const parts = node.value
						.split(/([{}])/)
						.filter(Boolean)
						.map((part) =>
							part === '{' || part === '}'
								? { type: 'html', value: part === '{' ? '&#123;' : '&#125;' }
								: { ...node, value: part }
						);
					parent.children.splice(index, 1, ...parts);
					index += parts.length - 1;
				} else {
					processChildren(node);
				}
			}
		};

		processChildren(tree);
	};
}

// rehype-figure replaces the whole paragraph with the figure, dropping any text written right after the image
function rehypeArticleFigures() {
	const buildFigure = (image) => ({
		type: 'element',
		tagName: 'figure',
		properties: { className: ['centerImage'] },
		children: [
			{ type: 'element', tagName: 'img', properties: { ...image.properties }, children: [] },
			...(image.properties?.alt?.trim()
				? [
						{
							type: 'element',
							tagName: 'figcaption',
							properties: {},
							children: [{ type: 'text', value: image.properties.alt }]
						}
					]
				: [])
		]
	});

	return (tree) => {
		const visit = (parent) => {
			if (!parent.children) return;

			const children = [];
			for (const node of parent.children) {
				if (node.type !== 'element' || node.tagName !== 'p') {
					visit(node);
					children.push(node);
					continue;
				}

				const images = node.children.filter((child) => child.tagName === 'img');
				if (images.length === 0) {
					children.push(node);
					continue;
				}

				const rest = node.children.filter(
					(child) => child.tagName !== 'img' && !(child.type === 'text' && !child.value.trim())
				);
				if (images.length === 1) {
					children.push(buildFigure(images[0]));
				} else {
					children.push({
						type: 'element',
						tagName: 'div',
						properties: { className: ['centerImage-container'] },
						children: images.map(buildFigure)
					});
				}
				if (rest.length > 0) {
					if (rest[0].type === 'text') rest[0] = { ...rest[0], value: rest[0].value.trimStart() };
					children.push({ ...node, children: rest });
				}
			}
			parent.children = children;
		};

		visit(tree);
	};
}

// base.css styles kramdown's footnote markup: `a.footnote` references and `<li><p>` definitions
function rehypeArticleFootnotes() {
	const hasClass = (node, name) => {
		const className = node.properties?.className;
		return Array.isArray(className) ? className.includes(name) : className === name;
	};

	return (tree) => {
		const visit = (node) => {
			if (!node.children) return;

			if (node.type === 'element' && node.tagName === 'a' && hasClass(node, 'footnote-ref')) {
				node.properties.className = ['footnote'];
			}

			if (
				node.type === 'element' &&
				node.tagName === 'li' &&
				node.properties?.id?.startsWith('fn-')
			) {
				node.children = [
					{ type: 'element', tagName: 'p', properties: {}, children: node.children }
				];
			}

			node.children.forEach(visit);
		};

		visit(tree);
	};
}

function getHeadingText(node) {
	if (node.type === 'text') return node.value;
	return node.children?.map(getHeadingText).join('') ?? '';
}

function rehypeArticleHeadings() {
	return (tree) => {
		const usedIds = new Set();

		const visit = (parent) => {
			if (!parent.children) return;

			const children = [];
			for (const node of parent.children) {
				visit(node);

				if (node.type !== 'element' || !['h2', 'h3'].includes(node.tagName)) {
					children.push(node);
					continue;
				}

				node.properties ??= {};
				if (!node.properties.id) {
					const baseId =
						getHeadingText(node)
							.toLowerCase()
							.normalize('NFKD')
							.replace(/\p{Diacritic}/gu, '')
							.replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
							.trim()
							.replace(/\s+/g, '-') || 'section';
					let id = baseId;
					let suffix = 1;
					while (usedIds.has(id)) {
						id = `${baseId}-${suffix}`;
						suffix += 1;
					}
					node.properties.id = id;
				}
				usedIds.add(node.properties.id);

				const permalink = {
					type: 'element',
					tagName: 'a',
					properties: {
						className: ['header-permalink'],
						href: `#${node.properties.id}`,
						'aria-label': `Permalink to ${getHeadingText(node)}`
					},
					children: [
						{
							type: 'element',
							tagName: 'i',
							properties: {
								className: ['ph-bold', 'ph-link-simple'],
								'aria-hidden': 'true'
							},
							children: []
						}
					]
				};

				if (node.tagName === 'h2') {
					children.push({
						type: 'element',
						tagName: 'div',
						properties: { className: ['cardHeader'] },
						children: [node, permalink]
					});
				} else {
					node.children.push(permalink);
					children.push(node);
				}
			}
			parent.children = children;
		};

		visit(tree);
	};
}

export const mdsvexPreprocessor = mdsvex({
	extensions: ['.md'],
	remarkPlugins: [[remarkFootnotes, { inlineNotes: true }], remarkKramdownAttributes],
	rehypePlugins: [rehypeArticleFigures, rehypeArticleFootnotes, rehypeArticleHeadings],
	layout: {
		article: articleLayout,
		post: articleLayout,
		_: articleLayout
	}
});
