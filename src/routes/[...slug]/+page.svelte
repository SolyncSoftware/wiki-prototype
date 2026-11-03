<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let Content = $derived(data.content);
</script>

<svelte:head>
	<title>{data.meta.title} | Camellia Wiki</title>
	<meta name="description" content={data.meta.description ?? ''} />
</svelte:head>

<Content />
