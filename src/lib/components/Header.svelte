<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';

	let sidebarOpen = $state(false);
	let headerSticky = $state(false);

	// Sidebar sets `open` itself via the binding, so scroll lock must follow state, not click handlers
	$effect(() => {
		document.body.classList.toggle('stop-scrolling', sidebarOpen);
		return () => document.body.classList.remove('stop-scrolling');
	});

	function toggleSidebar(event?: Event) {
		if (event) event.stopPropagation();
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	onMount(() => {
		const scrollDetect = () => {
			const main = document.querySelector('main');
			headerSticky = window.scrollY > 222 && !!main && main.getBoundingClientRect().top <= 0;
		};

		const onKeyUp = (event: KeyboardEvent) => {
			const active = document.activeElement;
			const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
			if (event.key === 'Escape' && sidebarOpen) closeSidebar();
			else if (
				event.key === 'q' &&
				!isInput &&
				!document.querySelector<HTMLDialogElement>('#imageModal')?.open
			) {
				document.getElementById('hamburgerBtn')?.click();
			}
		};

		const script = document.createElement('script');
		script.src = '/assets/scripts/optimized-search.js';
		script.defer = true;
		document.head.appendChild(script);

		const updateDisclaimerPosition = () => {
			const footer = document.querySelector('footer');
			const siteDisclaimer = document.getElementById('siteDisclaimer');
			if (!footer || !siteDisclaimer) return;

			const footerRect = footer.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			if (footerRect.top < windowHeight && footerRect.bottom > 0) {
				const visibleHeight = windowHeight - footerRect.top;
				const bottomValue = Math.min(64, visibleHeight);
				siteDisclaimer.style.bottom = `${bottomValue}px`;
			} else {
				siteDisclaimer.style.bottom = '0';
			}
		};

		window.addEventListener('scroll', updateDisclaimerPosition);
		window.addEventListener('resize', updateDisclaimerPosition);
		updateDisclaimerPosition();

		window.addEventListener('scroll', scrollDetect);
		window.addEventListener('keyup', onKeyUp);

		return () => {
			window.removeEventListener('scroll', updateDisclaimerPosition);
			window.removeEventListener('resize', updateDisclaimerPosition);
			window.removeEventListener('scroll', scrollDetect);
			window.removeEventListener('keyup', onKeyUp);
			document.head.removeChild(script);
		};
	});
</script>

<header
	class:sticky={headerSticky}
	class="top-0 border-base-content/20 transition-height ease-in-out fixed z-1 w-full overflow-visible border-b backdrop-blur-[10px] duration-200"
>
	<div class="header-shared flex w-full items-center justify-center overflow-hidden">
		<div id="btnContainer">
			<button
				id="hamburgerBtn"
				aria-label="Open menu"
				onclick={toggleSidebar}
				class="text-base-content hover:bg-base-300 rounded-4xl p-1 flex-shrink-0 cursor-pointer border-none bg-none"
			>
				<i class="ph-bold ph-list text-[42px]"></i>
			</button>
		</div>
		<div
			class="header-inner self-flex-start border-base-content/20 px-8 py-3 flex flex-1 flex-shrink-0 items-center justify-between rounded-b-[25px] border-b bg-[image:var(--wiki-brand-gradient)] transition-all duration-200"
		>
			<h1 class="logo transition-font-size ease-in-out text-[42px] font-[281] duration-200">
				<a href={resolve('/')} class="m-0 flex h-full items-center justify-center">
					<img
						src="/assets/images/caramel.png"
						alt="camellia wiki logo"
						class="ease-in-out mr-3 w-13.5 transition-all duration-200"
					/>
					Camellia &#8226; Wiki
				</a>
			</h1>
			<div id="search-container">
				<label
					id="main-bar"
					class="input input-primary h-13 w-113.5 pr-0 pl-6 flex flex-shrink-0 items-center overflow-hidden rounded-full border-[3px] transition-all duration-200"
				>
					<input
						type="text"
						id="search-input"
						placeholder="Search the Wiki..."
						class="text-lg grow font-['Author'] font-[494]"
					/>
					<span
						class="searchBtn text-base-content bg-base-300 h-11.5 w-14.5 flex flex-shrink-0 items-center justify-center"
					>
						<i
							class="ph-bold ph-magnifying-glass transition-font-size ease-in-out text-[28px] duration-200"
						></i>
					</span>
				</label>
				<div
					id="results-fixstuff"
					class="border-base-content/20 bg-base-200 mt-5.5 mr-6 ml-6 max-h-102 w-101.5 p-4 absolute z-1 hidden flex-col rounded-b-[30px] border-r border-b border-l bg-[image:var(--wiki-brand-gradient)] shadow-[0_4px_4px_0_var(--wiki-shadow-color)]"
				>
					<ul
						id="results-container"
						class="items-flex-start gap-2 px-2 pb-2 flex flex-col overflow-auto"
					></ul>
				</div>
			</div>
		</div>
		<div id="twoBotans" class="flex">
			<a
				id="githubBtn"
				href="https://github.com/solyncsoftware/wiki-prototype"
				target="_blank"
				class="text-base-content hover-underline-none hover:bg-base-300 p-1 flex-shrink-0 rounded-[25px] border-none bg-none"
			>
				<i class="ph-bold ph-github-logo text-[32px]"></i>
			</a>
			<a
				id="discordBtn"
				href="https://discord.com/invite/camellia"
				target="_blank"
				class="text-base-content hover-underline-none hover:bg-base-300 p-1 flex-shrink-0 rounded-[25px] border-none bg-none"
			>
				<i class="ph-bold ph-discord-logo text-[32px]"></i>
			</a>
		</div>
		<Sidebar bind:open={sidebarOpen} onClose={closeSidebar} />
	</div>
</header>

<style>
	header {
		height: 88px;
		line-height: normal;
		background: linear-gradient(
			180deg,
			var(--color-base-100) 0%,
			color-mix(in srgb, var(--color-base-100) 52%, transparent) 48.96%,
			transparent 100%
		);
	}

	header.sticky {
		height: 68px;
	}

	header.sticky .logo {
		font-size: 32px;
		font-style: normal;
		line-height: normal;
	}

	header.sticky .logo img {
		width: 44px;
	}

	header.sticky .header-inner {
		height: initial;
		padding: 8px 32px;
	}

	header.sticky #search-container #results-fixstuff {
		margin-top: 16px;
	}

	header.sticky #search-container #main-bar {
		flex-shrink: 0;
		height: 42px;
	}

	header.sticky #search-container #main-bar .searchBtn {
		flex-shrink: 0;
		width: 48px;
		height: 36px;
	}

	header.sticky #search-container #main-bar .searchBtn .ph-bold.ph-magnifying-glass {
		font-size: 24px;
	}

	@media not all and (max-width: 1230px) {
		header .header-shared {
			min-height: 100%;
			flex-direction: row;
			justify-content: space-evenly;
		}
		header #btnContainer {
			text-align: center;
			width: 150px;
		}
		header #hamburgerBtn .ph-bold.ph-list {
			font-size: 42px;
		}
		header #twoBotans {
			display: flex;
			width: 150px;
			justify-content: space-evenly;
		}
		header .header-inner h1 {
			font-size: 42px;
			font-weight: 281;
		}
		header .header-inner #search-container input:-webkit-autofill,
		header .header-inner #search-container input:-webkit-autofill:hover,
		header .header-inner #search-container input:-webkit-autofill:focus,
		header .header-inner #search-container input:-webkit-autofill:active {
			-webkit-box-shadow: 0 0 0 30px var(--color-base-200) inset !important;
		}
		header .header-inner #search-container input:-webkit-autofill {
			-webkit-text-fill-color: var(--color-base-content) !important;
		}
	}

	@media all and (max-width: 1230px) {
		header {
			height: 52px;
			transition: all 0.2s ease-in-out;
		}
		header .header-shared {
			flex-direction: row;
			justify-content: center;
			min-height: 100%;
			gap: 10px;
		}
		header #hamburgerBtn {
			margin-left: 10px;
		}
		header #hamburgerBtn .ph-bold.ph-list {
			font-size: 32px;
		}
		header #twoBotans {
			display: none;
		}
		header #main-bar {
			display: none;
		}
		header .header-inner {
			background:
				linear-gradient(
					180deg,
					transparent 0%,
					color-mix(in srgb, var(--color-primary) 8%, transparent) 51.04%,
					color-mix(in srgb, var(--color-accent) 20%, transparent) 100%
				),
				var(--color-accent);
			display: flex;
			align-self: flex-start;
			flex: 1;
			padding: 8px 16px;
			justify-content: space-between;
			align-items: center;
			flex-shrink: 0;
			transition: transform 0.2s;
			border-radius: 0 0 10px 25px;
			border-bottom: 1px solid color-mix(in srgb, var(--color-base-content) 20%, transparent);
		}
		header .header-inner h1 a {
			gap: 5px;
			font-size: 24px;
			font-weight: 300;
		}
		header .header-inner h1 a img {
			margin-right: 8px;
			width: 32px;
		}
	}
</style>
