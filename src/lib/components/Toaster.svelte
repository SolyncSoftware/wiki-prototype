<script lang="ts">
	import { dismissToast, toasts, type ToastStyle } from '$lib/toast.svelte';

	const colors: Record<ToastStyle, string> = {
		success: 'var(--color-success)',
		error: 'var(--color-error)',
		info: 'var(--color-info)'
	};
</script>

<div
	class="toast toast-end toast-top w-75 gap-5 p-0 z-50 max-w-[calc(100vw-2.5rem)]"
	style="top: 1.25rem; right: 1.25rem;"
	aria-live="polite"
>
	{#each toasts as toast, index (toast.id)}
		<div
			role="alert"
			class="toast-card flex"
			class:dimmed={index < toasts.length - 1}
			style:--toast-color={colors[toast.style]}
		>
			<div class="min-w-0 pr-2.5 flex-1 overflow-hidden">
				{#if toast.title}<h3 class="toast-title">{toast.title}</h3>{/if}
				{#if toast.content}<div class="toast-content">{toast.content}</div>{/if}
			</div>
			<button
				type="button"
				class="toast-close"
				aria-label="Dismiss"
				onclick={() => dismissToast(toast.id)}
			>
				<i class="ph ph-x"></i>
			</button>
		</div>
	{/each}
</div>

<style>
	/* base.css's unlayered `* { padding: 0 }` beats DaisyUI layers, so spacing is explicit here */
	.toast-card {
		padding: 10px;
		border-radius: 10px;
		border-left: 4px solid var(--toast-color);
		box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.12);
		background:
			linear-gradient(
				180deg,
				rgba(246, 65, 141, 0) 0%,
				rgba(246, 65, 141, 0.08) 51.04%,
				rgba(91, 63, 75, 0.2) 100%
			),
			var(--color-base-200);
		transition: opacity 0.5s ease;
		animation: toast-in 0.5s ease;

		&.dimmed {
			opacity: 0.727;

			&:hover {
				opacity: 1;
			}
		}
	}

	.toast-title {
		padding: 0 0 5px 0;
		font-size: 14px;
		font-weight: 600;
		word-break: break-all;
	}

	.toast-content {
		font-size: 14px;
		word-break: break-all;
	}

	.toast-close {
		align-self: flex-start;
		padding-bottom: 4px;
		font-size: 24px;
		line-height: 24px;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;

		&:hover {
			color: #fff;
		}
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(150%);
		}
	}
</style>
