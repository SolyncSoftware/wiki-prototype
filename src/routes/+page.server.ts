import { getPublishedArticles } from '#lib/data/articles.js';
import type { ArticleEntry } from '#lib/utils/types.js';
import type { PageServerLoad } from './$types';

const SIDEBAR_LIMIT = 4;

function getRequiredDescription(article: ArticleEntry) {
	if (typeof article.description !== 'string' || article.description.trim() === '') {
		throw new Error(`Expected a description for homepage Wiki article "${article.title}".`);
	}
	return article.description;
}

function toSummary(article: ArticleEntry) {
	return {
		title: article.title,
		...(article.author ? { author: article.author } : {}),
		href: article.href,
		slug: article.slug
	};
}

export const load: PageServerLoad = () => {
	const articles = getPublishedArticles();
	const wikiArticles = articles.filter((article) => article.section === 'wiki');
	const includedArticles = articles.filter((article) => article.section === 'include');
	const includedByTitle = new Map<string, ArticleEntry[]>();

	for (const article of includedArticles) {
		const matches = includedByTitle.get(article.title) ?? [];
		matches.push(article);
		includedByTitle.set(article.title, matches);
	}

	return {
		wikiArticles: wikiArticles.map((article) => ({
			...toSummary(article),
			description: getRequiredDescription(article),
			includedArticles: article.includeTitles.flatMap((title) =>
				(includedByTitle.get(title) ?? []).map(toSummary)
			)
		})),
		newsArticles: articles
			.filter((article) => article.section === 'news')
			.slice(0, SIDEBAR_LIMIT)
			.map(toSummary),
		communityArticles: articles
			.filter((article) => article.section === 'blog')
			.slice(0, SIDEBAR_LIMIT)
			.map(toSummary)
	};
};
