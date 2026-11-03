<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	const is404 = $derived(page.status === 404);

	let message = $state("There's nothing here.");

	onMount(() => {
		if (!is404) return;
		const base = 7270;
		const timers = [
			setTimeout(() => (message = "No, really, there's nothing here."), base),
			setTimeout(
				() => (message = "No, really, there's nothing here. Why are you still here?"),
				base + 8000
			),
			setTimeout(() => (message = 'You know what...'), base + 18000),
			setTimeout(() => {
				message = '>:)';
				window.location.href = 'https://youtu.be/qbnt_vmk4fU';
			}, base + 20000)
		];
		return () => timers.forEach(clearTimeout);
	});
</script>

<svelte:head>
	<title>{page.status} | Camellia Wiki</title>
</svelte:head>

<main class="gap-4 pt-40 pb-16 flex min-h-screen flex-col items-center justify-center text-center">
	<h1 class="gap-3 font-normal flex items-center text-[2.625rem]!">
		<img src="/assets/images/caramel.png" alt="" class="w-14" />
		<span>Camellia &bull; Wiki</span>
	</h1>

	{#if is404}
		<p class="text-lg">{message}</p>
		<img src="/assets/images/404.png" alt="404 illustration" class="w-32" />
	{:else}
		<p class="text-error text-2xl font-semibold">Error {page.status}</p>
		<p class="text-lg">{page.error?.message ?? 'Something went wrong.'}</p>
	{/if}

	<a href={resolve('/')} class="btn btn-wiki mt-2">Go home</a>
</main>
