<script lang="ts">
	import { onMount } from 'svelte';

	let dialog: HTMLDialogElement;
	let imageSrc = $state('');
	let imageAlt = $state('');

	function handleDocClick(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof HTMLImageElement) || !target.closest('.cardContents')) return;

		imageSrc = target.currentSrc || target.src;
		imageAlt = target.alt;
		dialog.showModal();
		document.body.classList.add('stop-scrolling');
		event.stopPropagation();
	}

	onMount(() => {
		document.addEventListener('click', handleDocClick, true);
		return () => {
			document.removeEventListener('click', handleDocClick, true);
			document.body.classList.remove('stop-scrolling');
		};
	});
</script>

<dialog
	id="imageModal"
	bind:this={dialog}
	class="modal bg-neutral/40 backdrop-blur-[10px]"
	onclose={() => document.body.classList.remove('stop-scrolling')}
>
	<div class="modal-box max-w-275 p-0 max-sm:w-full w-4/5 bg-transparent shadow-none">
		<form method="dialog">
			<button
				class="btn btn-ghost btn-circle right-8.75 absolute text-[40px]"
				aria-label="Close modal"
			>
				<i class="ph-bold ph-x"></i>
			</button>
		</form>
		<img class="mx-auto block w-full" src={imageSrc} alt={imageAlt} />
		<p class="py-2.5 text-lg font-medium text-base-content mx-auto text-center">{imageAlt}</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close modal">close</button>
	</form>
</dialog>
