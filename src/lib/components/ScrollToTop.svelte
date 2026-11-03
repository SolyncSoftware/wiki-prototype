<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let atTopMode = $state(true);
	let locked = $state(false);

	let prevScrollPosition = 0;
	let isReturning = false;

	function onScroll() {
		if (isReturning) return;

		visible = window.scrollY > 400;

		if (window.scrollY !== prevScrollPosition) {
			atTopMode = true;
			prevScrollPosition = 0;
		} else {
			atTopMode = false;
		}
	}

	function onClick(event: MouseEvent) {
		event.preventDefault();

		if (prevScrollPosition > 0) {
			window.scrollTo({ top: prevScrollPosition, behavior: 'smooth' });
			prevScrollPosition = 0;
			atTopMode = true;
		} else {
			prevScrollPosition = window.scrollY;
			window.scrollTo({ top: 0, behavior: 'smooth' });
			atTopMode = false;
		}

		isReturning = true;
		locked = true;
		setTimeout(() => {
			isReturning = false;
			locked = false;
		}, 700);
	}

	onMount(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div
	id="scrollToTop"
	class="bottom-0 right-0 ease-in-out m-8 fixed z-1 cursor-pointer opacity-60 transition-opacity duration-250 hover:opacity-100"
	style:display={visible ? 'block' : 'none'}
	style:pointer-events={locked ? 'none' : 'auto'}
>
	<a
		href="#top"
		title={atTopMode ? 'Go to top' : 'Go to previous position'}
		aria-label={atTopMode ? 'Go to top' : 'Go to previous position'}
		class="btn btn-wiki btn-circle size-16! text-[32px]"
		onclick={onClick}
	>
		<i class="ph-bold {atTopMode ? 'ph-caret-up' : 'ph-caret-down'}"></i>
	</a>
</div>
