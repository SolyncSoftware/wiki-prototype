import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getArticleBySlug } from '$lib/data/articles';

export const load: PageLoad = ({ params }) => {
	const article = getArticleBySlug(params.slug);
	if (!article) error(404, `Could not find ${params.slug}`);

	return {
		content: article.module.default,
		meta: {
			title: article.title,
			description: article.description,
			author: article.author,
			date: article.metadata.date,
			layout: article.metadata.layout
		}
	};
};
