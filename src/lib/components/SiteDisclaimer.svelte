<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<a
	id="siteDisclaimer"
	href={resolve('/ceasing-operations')}
	class="bottom-16 p-5.5 fixed flex w-full items-center overflow-hidden [background-image:url('/assets/images/home-header.png')] [background-size:cover] [background-position:center_center]"
>
	<div
		id="dim"
		class="top-0 bg-neutral/40 absolute flex h-full w-full justify-center transition-all transition-colors duration-200 duration-400 group-hover:bg-transparent"
	>
		<p class="align-self-center text-base-content text-xl flex justify-self-center text-center">
			This version of the Camellia Wiki will cease operations on December 7th, 2024. Thank you for
			understanding.
		</p>
	</div>
</a>
