import fs from 'fs';
import path from 'path';

const articlesDir = path.resolve('src/articles');
const sections = fs
	.readdirSync(articlesDir, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name);

const searchData = [];

for (const section of sections) {
	const sectionDir = path.join(articlesDir, section);
	const walk = (dir, category) => {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath, category);
			} else if (entry.name.endsWith('.md') && entry.name !== '_template.md') {
				const content = fs.readFileSync(fullPath, 'utf-8');
				const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
				if (!frontmatterMatch) continue;

				const fm = {};
				for (const line of frontmatterMatch[1].split('\n')) {
					const colonIdx = line.indexOf(':');
					if (colonIdx === -1) continue;
					const key = line.slice(0, colonIdx).trim();
					const val = line.slice(colonIdx + 1).trim();
					fm[key] = val;
				}

				const title = fm.title || entry.name.replace('.md', '');
				const desc = fm.description || '';
				const author = fm.author || '';

				// Replicate articles.ts getSlug logic exactly
				const filename = entry.name;
				let filenameSlug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

				let slug;
				if (fm.permalink !== undefined) {
					slug = fm.permalink.replaceAll(':title', filenameSlug).replace(/^\/+|\/+$/g, '');
				} else if (section === 'pages') {
					slug = `${filenameSlug}.html`;
				} else if (filenameSlug === 'index') {
					slug = path.relative(articlesDir, dir).replace(/\\/g, '/');
					if (!slug) slug = '';
				} else {
					slug = filenameSlug;
				}

				searchData.push({
					title,
					author,
					category: fm.category || section,
					searchCategory: section,
					url: `/${slug}`,
					desc
				});
			}
		}
	};
	walk(sectionDir, section);
}

searchData.sort((a, b) => a.title.localeCompare(b.title));

const outputPath = path.resolve('static/search.json');
fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2));
console.log(`Generated search.json with ${searchData.length} articles`);
