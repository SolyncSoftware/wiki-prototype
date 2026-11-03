export type ToastStyle = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	title?: string;
	content?: string;
	style: ToastStyle;
}

const AUTO_CLOSE_MS = 5000;

let nextId = 0;

export const toasts = $state<Toast[]>([]);

export function dismissToast(id: number) {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) toasts.splice(index, 1);
}

export function pushToast(toast: Omit<Toast, 'id' | 'style'> & { style?: ToastStyle }) {
	const id = nextId++;
	toasts.push({ style: 'info', ...toast, id });
	setTimeout(() => dismissToast(id), AUTO_CLOSE_MS);
	return id;
}
