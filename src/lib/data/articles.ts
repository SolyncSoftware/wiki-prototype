import type { ArticleEntry, ArticleMetadata, MdsvexModule } from '#lib/utils/types.js';

const articleModules = import.meta.glob<MdsvexModule>('/src/articles/**/*.md', { eager: true });

function getRequiredString(metadata: ArticleMetadata, key: string, sourcePath: string) {
	const value = metadata[key];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Expected "${key}" in article front matter: ${sourcePath}`);
	}
	return value;
}

function getIncludeTitles(metadata: ArticleMetadata, sourcePath: string) {
	const include = metadata.include;
	if (include === undefined) return [];
	if (typeof include === 'string') {
		return include
			.split(',')
			.map((title) => title.trim())
			.filter(Boolean);
	}
	if (Array.isArray(include) && include.every((title) => typeof title === 'string')) {
		return include;
	}
	throw new Error(`Expected a comma-separated include list in article front matter: ${sourcePath}`);
}

function getSlug(sourcePath: string, section: string, metadata: ArticleMetadata) {
	const filename = sourcePath.split('/').at(-1);
	if (!filename) throw new Error(`Could not determine the article filename: ${sourcePath}`);

	const filenameSlug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
	if (metadata.permalink !== undefined) {
		if (typeof metadata.permalink !== 'string') {
			throw new Error(`Expected a string permalink in article front matter: ${sourcePath}`);
		}
		return metadata.permalink.replaceAll(':title', filenameSlug).replace(/^\/+|\/+$/g, '');
	}
	if (section === 'pages') return `${filenameSlug}.html`;
	if (filenameSlug === 'index') {
		return sourcePath.replace('/src/articles/', '').replace(/\/index\.md$/, '');
	}
	return filenameSlug;
}

function getPublishedAt(date: ArticleMetadata['date']) {
	if (date instanceof Date) return date.getTime();
	if (typeof date === 'string') {
		const timestamp = Date.parse(date);
		if (Number.isFinite(timestamp)) return timestamp;
	}
	return 0;
}

const entries = Object.entries(articleModules).map(([sourcePath, module]): ArticleEntry => {
	const metadata = module.metadata;
	const title = getRequiredString(metadata, 'title', sourcePath);
	const description = metadata.description;
	if (description != null && typeof description !== 'string') {
		throw new Error(`Expected a string description in article front matter: ${sourcePath}`);
	}
	const author = metadata.author;
	if (author !== undefined && typeof author !== 'string') {
		throw new Error(`Expected a string author in article front matter: ${sourcePath}`);
	}

	const relativePath = sourcePath.replace('/src/articles/', '');
	const section = relativePath.split('/')[0];
	if (!section) throw new Error(`Could not determine the article section: ${sourcePath}`);
	const slug = getSlug(sourcePath, section, metadata);

	return {
		title,
		...(typeof description === 'string' ? { description } : {}),
		...(typeof author === 'string' ? { author } : {}),
		slug,
		href: `/${slug}`,
		section,
		publishedAt: getPublishedAt(metadata.date),
		includeTitles: getIncludeTitles(metadata, sourcePath),
		metadata,
		module
	};
});

const routes = new Map<string, ArticleEntry>();
for (const article of entries) {
	const existing = routes.get(article.slug);
	if (existing) {
		throw new Error(
			`Articles share the route "${article.href}": "${existing.title}" and "${article.title}".`
		);
	}
	routes.set(article.slug, article);
}

export function getPublishedArticles() {
	return entries
		.filter((article) => article.metadata.published !== false)
		.sort((first, second) => second.publishedAt - first.publishedAt);
}

export function getArticleBySlug(slug: string) {
	const article = routes.get(slug);
	return article?.metadata.published === false ? undefined : article;
}
