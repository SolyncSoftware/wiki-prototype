const STORAGE_KEY = 'theme-custom';

export interface ThemeCustomization {
	primary: string;
	secondary: string;
	accent: string;
	base: string;
	boxRadius: number;
	fieldRadius: number;
	border: number;
	size: number;
	cardOpacity: number;
	depth: boolean;
	noise: boolean;
}

export const customization = $state<ThemeCustomization>({
	primary: '#000000',
	secondary: '#000000',
	accent: '#000000',
	base: '#000000',
	boxRadius: 1,
	fieldRadius: 1,
	border: 0.5,
	size: 0.25,
	cardOpacity: 100,
	depth: true,
	noise: false
});

const colorProps = {
	primary: '--color-primary',
	secondary: '--color-secondary',
	accent: '--color-accent',
	base: '--color-base-100'
} as const;

const inlineProps = [
	'--color-primary',
	'--color-secondary',
	'--color-accent',
	'--color-base-100',
	'--color-base-200',
	'--color-base-300',
	'--radius-box',
	'--radius-field',
	'--radius-selector',
	'--border',
	'--size-field',
	'--size-selector',
	'--card-opacity',
	'--depth',
	'--noise'
];

const root = () => document.documentElement;

// Resolves any CSS color (hex, oklch, ...) to #rrggbb so it can feed <input type="color">
function toHex(value: string): string {
	const ctx = document.createElement('canvas').getContext('2d');
	if (!ctx) return value;
	ctx.fillStyle = '#000000';
	ctx.fillStyle = value;
	return ctx.fillStyle;
}

function readVar(name: string) {
	return getComputedStyle(root()).getPropertyValue(name).trim();
}

export function clearInlineTheme() {
	for (const prop of inlineProps) root().style.removeProperty(prop);
}

export function loadThemeDefaults() {
	for (const key of Object.keys(colorProps) as (keyof typeof colorProps)[]) {
		customization[key] = toHex(readVar(colorProps[key]));
	}
	customization.boxRadius = parseFloat(readVar('--radius-box')) || 1;
	customization.fieldRadius = parseFloat(readVar('--radius-field')) || 1;
	customization.border = parseFloat(readVar('--border')) || 0.5;
	customization.size = parseFloat(readVar('--size-field')) || 0.25;
	customization.cardOpacity = 100;
	customization.depth = readVar('--depth') !== '0';
	customization.noise = readVar('--noise') === '1';
}

export function applyCustomization() {
	const style = root().style;
	style.setProperty('--color-primary', customization.primary);
	style.setProperty('--color-secondary', customization.secondary);
	style.setProperty('--color-accent', customization.accent);
	style.setProperty('--color-base-100', customization.base);
	style.setProperty('--color-base-200', `color-mix(in oklab, ${customization.base}, white 6%)`);
	style.setProperty('--color-base-300', `color-mix(in oklab, ${customization.base}, white 12%)`);
	style.setProperty('--radius-box', `${customization.boxRadius}rem`);
	style.setProperty('--radius-field', `${customization.fieldRadius}rem`);
	style.setProperty('--radius-selector', `${customization.fieldRadius}rem`);
	style.setProperty('--border', `${customization.border}px`);
	style.setProperty('--size-field', `${customization.size}rem`);
	style.setProperty('--size-selector', `${customization.size}rem`);
	style.setProperty('--card-opacity', String(customization.cardOpacity));
	style.setProperty('--depth', customization.depth ? '1' : '0');
	style.setProperty('--noise', customization.noise ? '1' : '0');
	localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(customization)));
}

export function restoreCustomization() {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return false;
	try {
		Object.assign(customization, JSON.parse(stored));
		applyCustomization();
		return true;
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		return false;
	}
}

export function resetCustomization() {
	localStorage.removeItem(STORAGE_KEY);
	clearInlineTheme();
	loadThemeDefaults();
}

const MAX_IMAGE_EDGE = 1600;

export const sidebarImage = $state({ active: false });
export const siteImage = $state({ active: false });
export const cardImage = $state({ active: false });

const imageSlots = {
	sidebar: { key: 'sidebar-image', cssVar: '--sidebar-image', state: sidebarImage },
	site: { key: 'site-image', cssVar: '--site-image', state: siteImage },
	card: { key: 'card-image', cssVar: '--card-image', state: cardImage }
};
type ImageSlot = keyof typeof imageSlots;

function paintImage(slot: ImageSlot, dataUrl: string | null) {
	const { cssVar, state } = imageSlots[slot];
	if (dataUrl) root().style.setProperty(cssVar, `url("${dataUrl}")`);
	else root().style.removeProperty(cssVar);
	state.active = !!dataUrl;
	if (slot === 'site') root().toggleAttribute('data-site-bg', !!dataUrl);
	if (slot === 'card') root().toggleAttribute('data-card-bg', !!dataUrl);
}

export function restoreImages() {
	for (const slot of Object.keys(imageSlots) as ImageSlot[]) {
		paintImage(slot, localStorage.getItem(imageSlots[slot].key));
	}
}

export function clearImage(slot: ImageSlot) {
	localStorage.removeItem(imageSlots[slot].key);
	paintImage(slot, null);
}

// Downscaled to a JPEG so it fits in localStorage
export async function setImage(slot: ImageSlot, file: File): Promise<void> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
	localStorage.setItem(imageSlots[slot].key, dataUrl);
	paintImage(slot, dataUrl);
}
