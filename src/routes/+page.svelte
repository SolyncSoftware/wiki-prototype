<script lang="ts">
	import { resolve } from '$app/paths';
	import TitleContainer from '$lib/components/TitleContainer.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Homepage | Camellia Wiki</title>
	<meta
		name="description"
		content="The Camellia Wiki includes the focus on Camellia, his works, and rhythm games he has associated with. We encourage you to take a look!"
	/>
	<meta property="og:title" content="Homepage | Camellia Wiki" />
	<meta
		property="og:description"
		content="The Camellia Wiki includes the focus on Camellia, his works, and rhythm games he has associated with. We encourage you to take a look!"
	/>
</svelte:head>

<main>
	<TitleContainer title="Welcome to the Camellia Wiki" {subtitle} />
	{#snippet subtitle()}
		Where most of Camellia's work is documented. Including the fandom.
	{/snippet}
	<div
		class="cardBackground bg-base-100 border-base-300 mb-18 min-h-181.75 max-w-305 gap-2.5 p-8 rounded-box flex flex-col border-2 shadow-[0_8px_32px_0_var(--wiki-shadow-strong-color)]"
	>
		<div id="wikiArticle" class="gap-2.5 flex shrink-0 flex-row justify-between">
			<div class="alignmentContainer flex flex-1 flex-col">
				<div class="card site-card mb-2.5! max-w-206.75 leading-6.5 rounded-box">
					<div class="cardContents">
						<div
							class="cardHeader border-base-300 h-21 flex w-full justify-between border-t-2 border-b-2 bg-(image:--wiki-card-header-gradient)"
						>
							<h2
								class="leading-initial mr-8 ml-8 self-center overflow-hidden text-ellipsis whitespace-nowrap"
							>
								Let's Get Started!
							</h2>
						</div>
						<p class="px-8 pb-8 leading-6.5">
							The Header has important buttons to keep in mind. The navigation bar, the search bar,
							the GitHub button, and the Discord button.
						</p>
						<p class="px-8 pb-8 leading-6.5">
							Each of these buttons serves a purpose with navigation, including navigating you out
							of the site! It is recommended to use this homepage or the sidebar when exploring the
							site (to access the sidebar, click the hamburger icon on the top far left). If you
							don't know what you're looking for, use the search bar in the header to search for an
							article. You can search for author names, too!
						</p>
					</div>
				</div>
				<div class="masonryLayout gap-2.5 columns-[304px]">
					{#each data.wikiArticles as article (article.href)}
						<div class="miniCard site-card mb-2.5 pb-8 leading-6.5 rounded-box break-inside-avoid">
							<div class="cardContents">
								<div class="cardHeader mb-4">
									<h2
										class="leading-initial mr-8 ml-8 self-center overflow-hidden text-ellipsis whitespace-nowrap"
									>
										{article.title}
									</h2>
								</div>
								<p class="leading-normal pr-12 pb-4 pl-12">{article.description}</p>
								<div class="card-actions mr-8 ml-8">
									<a
										href={resolve('/[...slug]', { slug: article.slug })}
										class="btn btn-wiki relative w-full"
									>
										Read this Article <i
											class="ph-bold ph-caret-right right-2.5 absolute"
											aria-hidden="true"
										></i>
									</a>
								</div>
								{#if article.includedArticles.length > 0}
									<h3 class="mt-4 mb-2 ml-8">What's also Included</h3>
									<hr class="bg-neutral mr-8 mb-2 ml-8 h-px border-0" />
									<ul class="pl-0 mr-8 ml-8 list-none">
										{#each article.includedArticles as includedArticle (includedArticle.href)}
											<li class="pr-2.5 pb-2 pl-2.5 text-lg leading-6.5 relative flex items-center">
												<a
													href={resolve('/[...slug]', { slug: includedArticle.slug })}
													class="display-contents"
												>
													{includedArticle.title}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div
				id="navWedge"
				class="bg-base-200 w-70.75 rounded-box flex shrink-0 flex-col bg-(image:--wiki-brand-gradient)"
			>
				<div id="navWedgeContainer" class="top-16 p-4 sticky">
					<h3 class="mt-0">Other Articles</h3>
					<hr class="ml-0 mr-0 bg-neutral mt-2 mb-2 h-0.5 border-0" />
					<nav id="navWedgeItems" class="font-500 text-lg block overflow-auto overflow-y-scroll">
						<h3 class="mb-2">News</h3>
						<ul class="gap-2 px-2 pb-2 flex w-full flex-col overflow-auto">
							{#each data.newsArticles as article (article.href)}
								<li>
									<a
										href={resolve('/[...slug]', { slug: article.slug })}
										class="btn btn-wiki btn-wiki-stack"
									>
										{article.title}
										{#if article.author}<span class="author">Written by {article.author}</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
						<h3 class="mb-2">Community Posts</h3>
						<ul class="gap-2 px-2 pb-2 flex w-full flex-col overflow-auto">
							{#each data.communityArticles as article (article.href)}
								<li>
									<a
										href={resolve('/[...slug]', { slug: article.slug })}
										class="btn btn-wiki btn-wiki-stack"
									>
										{article.title}
										{#if article.author}<span class="author">Written by {article.author}</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
					</nav>
					<a href={resolve('/blog')} class="btn btn-wiki mt-2 w-full">
						View all posts <i class="ph-bold ph-arrow-right" aria-hidden="true"></i>
					</a>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	@media screen and (max-width: 750px) {
		.card {
			min-width: 0 !important;
			max-width: 100% !important;
		}
	}
</style>
