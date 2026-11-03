<script lang="ts">
	import { onMount } from 'svelte';
	import { pushToast } from '$lib/toast.svelte';

	interface Comment {
		id: string;
		name: string;
		content: string;
		timestamp: string;
	}

	let { slug }: { slug?: string } = $props();

	let comments = $state<Comment[]>([]);
	let loading = $state(true);
	let name = $state('');
	let content = $state('');
	let submitting = $state(false);

	onMount(async () => {
		if (!slug) {
			loading = false;
			return;
		}
		try {
			const res = await fetch(`/api/comments/${slug.split('/').map(encodeURIComponent).join('/')}`);
			if (res.ok) {
				comments = await res.json();
			}
		} catch {
			// comments unavailable
		} finally {
			loading = false;
		}
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			(e.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
		}
	}

	async function handleSubmit(e?: Event) {
		e?.preventDefault();
		if (!slug || !name.trim() || !content.trim()) return;
		submitting = true;
		try {
			const res = await fetch(
				`/api/comments/${slug.split('/').map(encodeURIComponent).join('/')}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: name.trim(), content: content.trim() })
				}
			);
			if (res.ok) {
				const comment = (await res.json()) as Comment;
				comments = [comment, ...comments];
				name = '';
				content = '';
				pushToast({ title: 'Comment posted!', style: 'success' });
			} else {
				const err = (await res.json()) as { error?: string };
				pushToast({
					title: 'Comment Submission Failed!',
					content: err.error ?? 'Failed to post comment',
					style: 'error'
				});
			}
		} catch {
			pushToast({
				title: 'Comment Submission Failed!',
				content: 'Failed to post comment',
				style: 'error'
			});
		} finally {
			submitting = false;
		}
	}
</script>

<section id="commentSection" class="bg-base-200 max-w-284 gap-2 rounded-box flex flex-col">
	<h3 class="comments-title">Comments</h3>

	<div role="alert" class="alert alert-notice border-error bg-base-100 text-lg text-center">
		A notice for you
		<div class="notice-line my-2 h-0.5 mx-auto w-2/3"></div>
		Comments on this site are stored locally. Just enter your name and post.
	</div>

	<form
		id="my-comment-form"
		class="comment-box bg-base-300 gap-2.5 rounded-box flex items-start"
		onsubmit={handleSubmit}
	>
		<div class="avatar">
			<div class="w-10 outline-base-content rounded-full outline-2">
				<img src="/assets/images/avatar.png" alt="Profile avatar" />
			</div>
		</div>
		<div class="min-w-0 gap-1 flex grow flex-col">
			<input
				type="text"
				id="comment-name"
				placeholder="Your name"
				bind:value={name}
				maxlength="64"
				required
				class="input input-ghost comment-field font-semibold w-full"
			/>
			<textarea
				id="comment-input"
				rows="1"
				placeholder="Type some text here! Press enter to post. Use shift+enter for a new line."
				bind:value={content}
				onkeydown={onKeydown}
				required
				class="textarea textarea-ghost comment-field min-h-10 field-sizing-content w-full resize-none"
			></textarea>
		</div>
		<button
			type="submit"
			class="btn btn-ghost btn-circle comment-send"
			disabled={submitting}
			aria-label="Post comment"
		>
			<i class="ph-bold ph-paper-plane-right text-[22px]"></i>
		</button>
	</form>

	{#if comments.length > 0}
		<div class="comments-list gap-3 flex flex-col">
			{#each comments as comment (comment.id)}
				<article class="comment-box bg-base-300 gap-2.5 rounded-box flex items-start">
					<div class="avatar">
						<div class="w-10 outline-base-content rounded-full outline-2">
							<img src="/assets/images/avatar.png" alt="" />
						</div>
					</div>
					<div class="min-w-0 flex grow flex-col">
						<div class="gap-1.5 flex items-baseline">
							<span class="text-primary text-xl font-semibold">{comment.name}</span>
							<span class="text-neutral text-base font-medium">{formatDate(comment.timestamp)}</span
							>
						</div>
						<div class="comment-body text-lg wrap-anywhere whitespace-pre-wrap">
							{comment.content}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if loading}
		<span class="loading loading-spinner loading-lg self-center" aria-label="Loading comments"
		></span>
	{/if}
</section>

<style>
	/* base.css has an unlayered `* { padding: 0; margin: 0 }` that beats Tailwind/DaisyUI layers */
	#commentSection {
		padding: 32px;
	}

	.comments-title {
		padding-bottom: 8px;
		border-bottom: 1px solid var(--color-neutral);
	}

	.comments-title::before {
		content: '';
		display: inline-block;
		width: 4px;
		height: 17px;
		margin-right: 8px;
		border-radius: 2px;
		background: var(--color-secondary);
	}

	.alert {
		padding: 12px 16px;
	}

	.alert-notice {
		display: block;
		border-width: 0 0 0 2px;
		border-radius: 0;
	}

	.notice-line {
		margin: 8px auto;
		background: linear-gradient(to right, var(--color-primary), var(--color-error));
	}

	.comment-box {
		padding: 10px;
		box-shadow: 0 2px 6px 0 var(--wiki-shadow-color);
	}

	.comments-list {
		margin-top: 20px;
	}

	.comment-field {
		padding-inline: 12px;
	}

	textarea.comment-field {
		padding-block: 0.7em;
	}

	.comment-send {
		flex-shrink: 0;
		color: var(--color-neutral);
	}

	.comment-send:hover {
		color: var(--color-base-content);
	}

	.comment-body {
		line-height: 26px;
	}
</style>
