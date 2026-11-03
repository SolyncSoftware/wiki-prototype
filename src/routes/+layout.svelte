<script lang="ts">
	import '../app.css';
	import './layout.css';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href="/assets/images/caramel.png" />
	<link rel="stylesheet" href="/assets/css/base.css" />

	<link rel="stylesheet" href="/assets/css/highlights.css" />
	<link rel="stylesheet" href="/assets/css/author.css" />
	<link rel="stylesheet" href="/assets/css/mediaQueries.css" />
	<link rel="stylesheet" href="/assets/css/header.css" />
</svelte:head>

<ScrollToTop />
<Header />
{@render children()}
<Modal />
<Toaster />
<Footer />
