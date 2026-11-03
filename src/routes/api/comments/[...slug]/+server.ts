import type { RequestHandler } from './$types';
import { addComment, getComments } from '$lib/data/comments';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug as string;
	const comments = getComments(slug);
	return new Response(JSON.stringify(comments), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ params, request }) => {
	const slug = params.slug as string;
	try {
		const body = await request.json();
		const { name, content } = body;
		if (!name || !content) {
			return new Response(JSON.stringify({ error: 'Name and content are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		const comment = addComment(slug, { name, content });
		return new Response(JSON.stringify(comment), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid request' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
