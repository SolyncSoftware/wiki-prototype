import { getPublishedArticles } from '#lib/data/articles.js';
import type { ArticleEntry } from '#lib/utils/types.js';
import type { PageServerLoad } from './$types';

function toSummary(article: ArticleEntry) {
	return {
		title: article.title,
		...(article.author ? { author: article.author } : {}),
		slug: article.slug,
		href: article.href
	};
}

export const load: PageServerLoad = () => {
	const articles = getPublishedArticles();
	return {
		newsArticles: articles.filter((article) => article.section === 'news').map(toSummary),
		communityArticles: articles.filter((article) => article.section === 'blog').map(toSummary)
	};
};
