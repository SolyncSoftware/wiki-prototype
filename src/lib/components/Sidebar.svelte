<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ThemeCustomizer from '#lib/components/ThemeCustomizer.svelte';
	import {
		loadThemeDefaults,
		resetCustomization,
		restoreCustomization,
		restoreImages
	} from '#lib/theme.svelte.js';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = $bindable(false), onClose }: Props = $props();

	let navSidebar: HTMLElement | null = null;
	let hamburgerBtn: HTMLElement | null = null;

	const themes = [
		{ id: 'wiki-dark', label: 'Dark', icon: 'ph-moon' },
		{ id: 'wiki-purple', label: 'Purple', icon: 'ph-drop' },
		{ id: 'wiki-green', label: 'Green', icon: 'ph-leaf' }
	];

	let activeTheme = $state('wiki-dark');

	function linkHref(href: string) {
		if (href === '/') return resolve('/');
		if (href === '/tests') return resolve('/tests');
		return resolve('/[...slug]', { slug: href.slice(1) });
	}

	const siteLinks = [
		{ href: '/', title: 'Main Page', subtitle: 'Also known as the Homepage' },
		{ href: '/admin', title: 'Wiki Editor', subtitle: 'Also known as the CMS' },
		{
			href: '/contributing',
			title: 'How to Contribute',
			subtitle: 'Contributing Guidelines and Info!'
		},
		{ href: '/about', title: 'About Page', subtitle: 'What is this site about?' }
	] as const;

	const otherLinks = [
		{
			href: '/staffGuidelines',
			title: 'Staff Guidelines',
			subtitle: 'Camellia Server Staff Guidelines'
		},
		{
			href: '/camelliaConstitution',
			title: 'Discord Constitution',
			subtitle: 'Camellia Server Constitution'
		},
		{ href: '/tests', title: 'Site Tests', subtitle: 'Specific Pages for testing stuff' }
	] as const;

	$effect(() => {
		if (typeof document !== 'undefined') {
			activeTheme = document.documentElement.dataset.theme ?? 'wiki-dark';
		}
	});

	function closeSidebar() {
		open = false;
		onClose?.();
	}

	function handleSidebarXClick() {
		closeSidebar();
	}

	function handleDocClick(event: MouseEvent) {
		if (
			open &&
			navSidebar &&
			hamburgerBtn &&
			!navSidebar.contains(event.target as Node) &&
			event.target !== hamburgerBtn
		) {
			closeSidebar();
		}
	}

	function setTheme(theme: string) {
		document.documentElement.dataset.theme = theme;
		activeTheme = theme;
		localStorage.setItem('theme', theme);
		resetCustomization();
	}

	function loadTheme() {
		const stored = localStorage.getItem('theme');
		if (stored && themes.some((theme) => theme.id === stored)) {
			document.documentElement.dataset.theme = stored;
		}
	}

	onMount(() => {
		loadTheme();
		if (!restoreCustomization()) loadThemeDefaults();
		restoreImages();
		navSidebar = document.getElementById('navSidebar');
		hamburgerBtn = document.getElementById('hamburgerBtn');
		document.addEventListener('click', handleDocClick);

		return () => {
			document.removeEventListener('click', handleDocClick);
		};
	});
</script>

<div class="sidebar-wrapper" class:active={open}>
	<div id="navSidebar" class:active={open} bind:this={navSidebar}>
		<div id="navWedgeContainer">
			<div id="navHeader">
				<button id="sidebarX" aria-label="Close sidebar" onclick={handleSidebarXClick}>
					<i class="ph ph-x"></i>
				</button>
				<h3>Main Menu</h3>
			</div>
			<hr />
			<nav id="navWedgeItems">
				<!-- <h3>Profile</h3>
				<div class="profile-wrapper px-2.5">
					<div class="bg-base-300 rounded-field p-3! shadow-md flex items-center justify-between">
						<div class="gap-2.5 flex items-center">
							<div class="avatar">
								<div class="ring-base-content w-10 rounded-full ring-2">
									<img src="/assets/images/avatar.png" alt="Profile avatar" />
								</div>
							</div>
							<div class="leading-normal font-semibold">
								<p class="text-primary text-xl">Not Logged in!</p>
								<p class="text-neutral text-base">Login to access more features...</p>
							</div>
						</div>
						<button type="button" class="btn btn-ghost btn-square" aria-label="Log in">
							<i class="ph-bold ph-sign-in text-2xl"></i>
						</button>
					</div>
				</div> -->
				<!-- <hr /> -->
				<div class="wow">
					<iframe
						src="https://github.com/sponsors/solyncsoftware/button"
						title="Sponsor Solync"
						height="32"
						width="114"
						style="border: 0; border-radius: 6px"
					></iframe>
				</div>
				<h3>Theme</h3>
				<div class="theme-toggle join w-full" role="group" aria-label="Select theme">
					{#each themes as theme (theme.id)}
						<button
							type="button"
							class="btn join-item flex-1"
							class:btn-primary={activeTheme === theme.id}
							aria-pressed={activeTheme === theme.id}
							onclick={() => setTheme(theme.id)}
						>
							<i class="ph-bold {theme.icon}"></i>
							{theme.label}
						</button>
					{/each}
				</div>
				<ThemeCustomizer />
				<h3 class="mt-4!">Site Navigation</h3>
				<ol>
					{#each siteLinks as link (link.href)}
						<a href={linkHref(link.href)} class="btn btn-wiki btn-wiki-stack">
							{link.title}
							<div class="author">{link.subtitle}</div>
						</a>
					{/each}
				</ol>
				<h3>Other Pages</h3>
				<ol>
					{#each otherLinks as link (link.href)}
						<a href={linkHref(link.href)} class="btn btn-wiki btn-wiki-stack">
							{link.title}
							<div class="author">{link.subtitle}</div>
						</a>
					{/each}
				</ol>
			</nav>
		</div>
	</div>
</div>

<style>
	.wow {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sidebar-wrapper {
		position: fixed;
		width: 100vw;
		left: 0;
		transition-property: background-color, backdrop-filter;
		transition-duration: 400ms;
		pointer-events: none;

		&.active {
			backdrop-filter: blur(5px);
			-webkit-backdrop-filter: blur(5px);
			background-color: color-mix(in srgb, var(--color-neutral) 40%, transparent);
			pointer-events: all;
		}
	}

	#navSidebar {
		position: absolute;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		border-radius: 0px 30px 30px 0px;
		border-right: 1px solid color-mix(in srgb, var(--color-base-content) 20%, transparent);
		background:
			linear-gradient(
				180deg,
				transparent 0%,
				color-mix(in srgb, var(--color-primary) 8%, transparent) 51.04%,
				color-mix(in srgb, var(--color-accent) 20%, transparent) 100%
			),
			linear-gradient(
				color-mix(in srgb, var(--color-base-200) 55%, transparent),
				color-mix(in srgb, var(--color-base-200) 55%, transparent)
			),
			var(--sidebar-image, none) center / cover no-repeat,
			var(--color-base-200);
		transition: 0.4s;
		left: -406px;
		width: 406px;

		&.active {
			left: 0;
			box-shadow: 0px 4px 10px 0px var(--wiki-shadow-color);
		}
	}

	#navWedgeContainer {
		position: sticky;
		padding: 16px;
		width: 100%;
	}

	#navHeader {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	#sidebarX {
		display: flex;
		align-items: center;
		color: var(--color-base-content);
		background: none;
		border: none;
		font-size: 32px;
	}

	#sidebarX:hover {
		color: var(--color-neutral);
	}

	#navWedgeContainer hr {
		margin-top: 8px;
		margin-bottom: 8px;
		margin-left: 0;
		margin-right: 0;
		height: 2px;
	}

	#navWedgeItems {
		display: block;
		overflow-y: scroll;
		overflow: auto;
		font-size: 18px;
		font-weight: 500;
		max-height: calc(100vh - 168px);
	}

	#navWedgeItems h3:first-child {
		margin-top: 0;
	}

	#navWedgeItems h3 {
		margin-bottom: 8px;
	}

	#navWedgeItems h3::before {
		content: '';
		display: inline-block;
		background: var(--color-secondary) 0% 0% no-repeat padding-box;
		height: 17px;
		margin-right: 8px;
		width: 4px;
		position: inherit;
		border-radius: 2px;
	}

	#navWedgeItems ol {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		overflow: auto;
		padding: 0 12px 12px 12px;
	}

	/* base.css's unlayered `* { padding: 0 }` beats Tailwind/DaisyUI layers */
	.theme-toggle {
		margin-bottom: 8px;

		.btn {
			padding: 0 16px;
		}
	}

	@media not all and (max-width: 1230px) {
		.sidebar-wrapper {
			height: calc(100vh - 88px);
			top: 88px;
		}
		#navSidebar {
			left: -406px;
			width: 406px;
		}
	}

	@media all and (max-width: 1230px) {
		.sidebar-wrapper {
			height: calc(100vh - 52px);
			top: 52px;
		}
		#navSidebar {
			left: -100%;
			width: 100%;
		}
	}
</style>
