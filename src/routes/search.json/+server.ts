import { json } from '@sveltejs/kit';
import { getPublishedArticles } from '$lib/data/articles';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	json(
		getPublishedArticles().map((article) => ({
			title: article.title,
			desc: article.description ?? '',
			author: article.author ?? '',
			url: article.href
		}))
	);
