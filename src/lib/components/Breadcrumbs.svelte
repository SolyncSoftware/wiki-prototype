<script lang="ts">
	import { resolve } from '$app/paths';

	let { title = '', href = '/' }: { title?: string; href?: string } = $props();

	const segments = $derived(href.split('/').filter(Boolean));

	const formatTitle = (segment: string) => {
		const words = segment.replace(/-/g, ' ').replace('.html', '').split(' ');
		return words
			.map((word, i) => {
				const lower = word.toLowerCase();
				if ((lower === 'the' || lower === 'of' || lower === 'and') && i !== 0) return lower;
				return word.charAt(0).toUpperCase() + word.slice(1);
			})
			.join(' ');
	};
</script>

<div class="breadcrumbs ml-12! font-semibold [&_li]:gap-2 self-end">
	<ul>
		<li class="mr-1.5!"><a href={resolve('/')}>Homepage</a></li>
		{#each segments as segment, index (segment)}
			<li>
				{#if index === segments.length - 1}
					<span>{title || formatTitle(segment)}</span>
				{:else}
					<a
						class="mr-1.5!"
						href={resolve('/[...slug]', { slug: segments.slice(0, index + 1).join('/') })}
					>
						{formatTitle(segment)}
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</div>
