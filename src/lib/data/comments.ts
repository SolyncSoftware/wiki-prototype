import fs from 'fs';
import path from 'path';

const COMMENTS_DIR = path.join(process.cwd(), 'static', 'comments');

export interface Comment {
	id: string;
	name: string;
	content: string;
	timestamp: string;
}

function ensureCommentsDir() {
	if (!fs.existsSync(COMMENTS_DIR)) {
		fs.mkdirSync(COMMENTS_DIR, { recursive: true });
	}
}

function getCommentsFile(slug: string) {
	const safe = slug.replace(/[^a-zA-Z0-9._+-]+/g, '__').replace(/^\.+/, '');
	return path.join(COMMENTS_DIR, `${safe}.json`);
}

export function getComments(slug: string): Comment[] {
	ensureCommentsDir();
	const file = getCommentsFile(slug);
	if (!fs.existsSync(file)) return [];
	try {
		const data = fs.readFileSync(file, 'utf-8');
		const parsed = JSON.parse(data);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function addComment(slug: string, comment: Omit<Comment, 'id' | 'timestamp'>): Comment {
	ensureCommentsDir();
	const file = getCommentsFile(slug);
	const existing = getComments(slug);
	const id = crypto.randomUUID();
	const newComment: Comment = {
		id,
		name: comment.name.trim(),
		content: comment.content.trim(),
		timestamp: new Date().toISOString()
	};
	const updated = [...existing, newComment];
	fs.writeFileSync(file, JSON.stringify(updated, null, 2));
	return newComment;
}
