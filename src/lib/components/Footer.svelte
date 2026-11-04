<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer
	class="footer-bar border-base-content/20 h-16 mt-auto flex flex-row items-center justify-center border-t"
>
	<a
		href="https://github.com/solyncsoftware"
		target="_blank"
		class="hover:bg-accent left-1 rounded-sm p-1 absolute flex items-center transition-colors duration-150"
	>
		<img
			src="https://raw.githubusercontent.com/solyncsoftware/.github/refs/heads/main/maintainedby.png"
			alt="Maintained by Solync"
			height="48"
			class="h-12 w-auto"
		/>
	</a>
	<div class="text-xl flex flex-col items-center justify-center text-center">
		<p>
			<a href={resolve('/[...slug]', { slug: 'terms-of-service' })}>Terms of Service</a> •{' '}
			<a href={resolve('/[...slug]', { slug: 'privacy-policy' })}>Privacy Policy</a>
		</p>
		<p>
			Created by{' '}
			<a href="https://github.com/solyncsoftware/wiki-prototype" target="_blank">pptek</a>{' '}
			with the contribution of{' '}
			<a href="https://github.com/solyncsoftware/wiki-prototype/graphs/contributors" target="_blank">others</a
			>.
		</p>
	</div>
</footer>

<style>
	.footer-bar {
		background: var(--color-base-200);
	}
</style>
