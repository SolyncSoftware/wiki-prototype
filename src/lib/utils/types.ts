import type { Component } from 'svelte';

export interface ArticleMetadata {
	title?: string;
	description?: string;
	author?: string;
	date?: string | Date;
	include?: string | string[];
	layout?: string;
	permalink?: string;
	published?: boolean;
	[key: string]: unknown;
}

export interface MdsvexModule {
	default: Component;
	metadata: ArticleMetadata;
}

export interface ArticleEntry {
	title: string;
	description?: string;
	author?: string;
	slug: string;
	href: string;
	section: string;
	publishedAt: number;
	includeTitles: string[];
	metadata: ArticleMetadata;
	module: MdsvexModule;
}
