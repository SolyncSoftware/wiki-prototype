<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import TitleContainer from '$lib/components/TitleContainer.svelte';
	import { pushToast } from '$lib/toast.svelte';

	const newArticleLink = {
		href: 'https://github.com/solyncsoftware/wiki-articles',
		label: 'New Article Directory'
	};
	import Comments from '$lib/components/Comments.svelte';

	interface ArticleSection {
		id: string;
		title: string;
		subsections: { id: string; title: string }[];
	}

	let {
		title,
		author,
		date,
		layout,
		children
	}: {
		title: string;
		author?: string;
		date?: string | Date;
		layout?: string;
		children: Snippet;
	} = $props();

	let slug = $derived($page.params.slug as string);

	let contentElement = $state<HTMLDivElement>();
	let wedgeContainer = $state<HTMLDivElement>();
	let sections = $state<ArticleSection[]>([]);
	let activeHeadingId = $state<string>();
	let isSticky = $state(false);

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});

	function formatDate(value: string | Date) {
		const parsedDate = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(parsedDate.getTime())) {
			throw new Error(`Invalid article date: ${value}`);
		}
		const day = parsedDate.getUTCDate();
		const ordinal =
			day % 100 >= 11 && day % 100 <= 13 ? 'th' : ['st', 'nd', 'rd'][(day % 10) - 1] || 'th';
		return dateFormatter.format(parsedDate).replace(/\b(\d+)\b/, `$1${ordinal}`);
	}

	function styleArticleFigures(node: HTMLDivElement) {
		const styleFigure = (figure: Element) => {
			const image = figure.querySelector('img');
			if (!image) return;

			const updateFigureStyle = () => {
				const isCentered = image.naturalWidth > 370;
				figure.classList.toggle('centerImage', isCentered);
				figure.classList.toggle('floatImage', !isCentered);
			};

			if (image.complete) updateFigureStyle();
			else image.addEventListener('load', updateFigureStyle, { once: true });
		};

		node.querySelectorAll('figure.centerImage').forEach(styleFigure);

		const observer = new MutationObserver((records) => {
			for (const record of records) {
				for (const addedNode of record.addedNodes) {
					if (!(addedNode instanceof Element)) continue;
					if (addedNode.matches('figure.centerImage')) styleFigure(addedNode);
					addedNode.querySelectorAll?.('figure.centerImage').forEach(styleFigure);
				}
			}
		});
		observer.observe(node, { childList: true, subtree: true });

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	function copyHeadingPermalinks(node: HTMLDivElement) {
		const onClick = async (event: MouseEvent) => {
			const link = (event.target as Element).closest<HTMLAnchorElement>('a.header-permalink');
			if (!link) return;
			event.preventDefault();
			const url = `${window.location.origin}${window.location.pathname}${link.getAttribute('href')}`;
			try {
				await navigator.clipboard.writeText(url);
				pushToast({
					title: 'Success!',
					content: 'Permalink copied to your clipboard!',
					style: 'success'
				});
			} catch {
				pushToast({
					title: 'Uh-oh...',
					content: 'Could not copy permalink to your clipboard.',
					style: 'error'
				});
			}
		};
		node.addEventListener('click', onClick);
		return {
			destroy() {
				node.removeEventListener('click', onClick);
			}
		};
	}

	const dateLabel = $derived(date ? formatDate(date) : undefined);

	$effect(() => {
		const content = contentElement;
		if (layout !== 'article' || !content || !wedgeContainer) return;

		const buildContents = () => {
			const headings = content.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]');
			const nextSections: ArticleSection[] = [];
			let currentSection: ArticleSection | undefined;

			for (const heading of headings) {
				if (heading.tagName === 'H2') {
					currentSection = {
						id: heading.id,
						title: heading.textContent ?? '',
						subsections: []
					};
					nextSections.push(currentSection);
				} else if (currentSection) {
					currentSection.subsections.push({
						id: heading.id,
						title: heading.textContent ?? ''
					});
				}
			}

			sections = nextSections;
			activeHeadingId = undefined;
			headingObserver.disconnect();
			for (const heading of headings) headingObserver.observe(heading);
		};

		const headingObserver = new IntersectionObserver((entries) => {
			const visibleHeadings = entries
				.filter((entry) => entry.isIntersecting)
				.sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
			if (visibleHeadings[0]) {
				activeHeadingId = (visibleHeadings[0].target as HTMLHeadingElement).id;
			}
		});
		const observer = new MutationObserver(buildContents);
		observer.observe(content, { childList: true, subtree: true });
		buildContents();

		const main = content.closest('main');
		const updateStickyContents = () => {
			isSticky = Boolean(main && main.getBoundingClientRect().top <= 0 && window.scrollY > 298);
		};
		window.addEventListener('scroll', updateStickyContents, { passive: true });
		updateStickyContents();

		return () => {
			observer.disconnect();
			headingObserver.disconnect();
			window.removeEventListener('scroll', updateStickyContents);
		};
	});
</script>

<main class:layout-post={layout === 'post'} class="flex min-h-screen flex-col">
	<TitleContainer {title} {subtitle} {breadcrumbs} link={newArticleLink} />
	{#snippet subtitle()}
		Written by {author ?? 'Camellia Community'}{#if dateLabel}<span class="dateLabel"
				>&nbsp;on {dateLabel}</span
			>{/if}.
	{/snippet}
	{#snippet breadcrumbs()}
		<Breadcrumbs {title} href={$page.url.pathname} />
	{/snippet}
	<div
		class="cardBackground bg-base-100 border-base-300 mb-18 min-h-181.75 max-w-305 gap-2.5 p-8 rounded-box flex flex-col border-2 shadow-[0_8px_32px_0_var(--wiki-shadow-strong-color)]"
	>
		<div id="wikiArticle" class="gap-2.5 flex shrink-0 flex-row">
			{#if layout === 'article'}
				<div
					id="contentWedge"
					class="bg-base-200 w-70.75 rounded-box shrink-0 flex-col bg-(image:--wiki-brand-gradient)"
				>
					<div
						id="wedgeContainer"
						class:sticky={isSticky}
						bind:this={wedgeContainer}
						class="top-16 p-4 sticky"
					>
						<h2 class="mb-2">Contents</h2>
						<hr class="ml-0 mr-0 bg-neutral mt-1 mb-2.5 h-0.5 border-0" />
						<nav id="wedgeItems" class="font-500 text-lg block overflow-auto overflow-y-scroll">
							<ol class="font-semibold pl-4 list-decimal">
								{#each sections as section (section.id)}
									<li class:active={activeHeadingId === section.id}>
										<a href={`#${section.id}`}>{section.title}</a>
										{#if section.subsections.length > 0}
											<ul class="font-medium! mt-2 pl-4 list-disc">
												{#each section.subsections as subsection (subsection.id)}
													<li class:active={activeHeadingId === subsection.id}>
														<a href={`#${subsection.id}`}>{subsection.title}</a>
													</li>
												{/each}
											</ul>
										{/if}
									</li>
								{/each}
							</ol>
						</nav>
					</div>
				</div>
			{/if}
			<div class="card site-card mb-2.5 max-w-206.75 rounded-box leading-6.5">
				<div
					class="cardContents px-12 pb-8 leading-6.5"
					bind:this={contentElement}
					use:styleArticleFigures
					use:copyHeadingPermalinks
				>
					{@render children()}
				</div>
			</div>
		</div>
		<Comments {slug} />
	</div>
</main>

<style>
	#contentWedge #wedgeContainer #wedgeItems > ol {
		list-style-type: decimal;
		padding-left: 1.25rem;
	}

	#contentWedge #wedgeContainer #wedgeItems > ol > li::marker {
		color: var(--color-primary);
		transition: color 0.2s ease-in-out;
	}

	#contentWedge #wedgeContainer #wedgeItems > ol > li:hover::marker {
		color: var(--color-warning);
	}

	#contentWedge #wedgeContainer #wedgeItems > ol > li.active::marker {
		color: var(--color-base-content);
	}

	#contentWedge #wedgeContainer #wedgeItems ul {
		display: block;
		list-style-type: disc;
	}

	#contentWedge #wedgeContainer #wedgeItems ul li {
		display: list-item;
		margin-bottom: 0.5rem;
	}
</style>
