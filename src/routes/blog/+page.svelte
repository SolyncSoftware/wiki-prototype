<script lang="ts">
	import { resolve } from '$app/paths';
	import TitleContainer from '#lib/components/TitleContainer.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sections = $derived([
		{ heading: 'News', articles: data.newsArticles },
		{ heading: 'Community Posts', articles: data.communityArticles }
	]);
</script>

<svelte:head>
	<title>Blog | Camellia Wiki</title>
	<meta name="description" content="All news and community posts on the Camellia Wiki." />
</svelte:head>

<main>
	<TitleContainer title="Blog" {subtitle} />
	{#snippet subtitle()}
		News and community posts from the Camellia Wiki.
	{/snippet}
	<div
		class="cardBackground bg-base-100 border-base-300 mb-18 max-w-305 gap-8 p-8 rounded-box flex w-full flex-col border-2 shadow-[0_8px_32px_0_var(--wiki-shadow-strong-color)]"
	>
		{#each sections as section (section.heading)}
			<section>
				<h2 class="mb-2">{section.heading}</h2>
				<hr class="bg-neutral mb-4 h-0.5 border-0" />
				<ul class="gap-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
					{#each section.articles as article (article.href)}
						<li>
							<a
								href={resolve('/[...slug]', { slug: article.slug })}
								class="btn btn-wiki btn-wiki-stack"
							>
								{article.title}
								{#if article.author}<span class="author">Written by {article.author}</span>{/if}
							</a>
						</li>
					{:else}
						<li>Nothing here yet.</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</main>
