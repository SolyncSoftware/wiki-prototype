<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		breadcrumbs,
		link
	}: {
		title: string;
		subtitle: Snippet;
		breadcrumbs?: Snippet;
		link?: { href: string; label: string };
	} = $props();
</script>

<div class="title-container flex flex-col">
	<h1 class="font-semibold bg-base-300 px-2! rounded-selector self-center">{title}</h1>
	<p class="foot-note text-white/70 font-semibold bg-base-300 px-2! rounded-selector self-center">
		{@render subtitle()}
	</p>
	{#if breadcrumbs}
		<div class="text-lg font-semibold flex justify-between">
			{@render breadcrumbs()}
			{#if link}
				<a class="note-link self-end text-right" href={link.href} target="_blank">{link.label}</a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.title-container {
		min-width: 76rem;
		margin-top: 10.25rem;

		& h1 {
			font-size: 2.625rem;
			font-style: italic;
			margin-bottom: 0.5rem;
		}
		& .foot-note {
			margin-bottom: 3.625rem;
		}
		& .note-link {
			margin-left: 0.875rem;
			margin-right: 3rem;
		}
	}

	@media (max-width: 1230px) {
		.title-container {
			min-width: 100%;
			margin-top: 7.75rem;
			text-align: center;

			& .note-link {
				align-self: center;
				margin-right: 0;
			}
		}
	}
</style>
