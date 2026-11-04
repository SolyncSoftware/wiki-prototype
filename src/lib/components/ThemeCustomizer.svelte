<script lang="ts">
	import {
		applyCustomization,
		cardImage,
		clearImage,
		customization,
		resetCustomization,
		setImage,
		// sidebarImage,
		siteImage
	} from '#lib/theme.svelte.js';

	const imageFields = [
		{ slot: 'site', label: 'Website background', state: siteImage },
		{ slot: 'card', label: 'Card background', state: cardImage }
		// { slot: 'sidebar', label: 'Sidebar background', state: sidebarImage }
	] as const;

	let imageError = $state('');

	async function onImagePicked(event: Event, slot: 'site' | 'sidebar' | 'card') {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		imageError = '';
		try {
			await setImage(slot, file);
		} catch {
			imageError = 'Could not use that image.';
		}
		input.value = '';
	}

	const colors = [
		{ key: 'primary', label: 'Primary' },
		{ key: 'secondary', label: 'Secondary' },
		{ key: 'accent', label: 'Accent' },
		{ key: 'base', label: 'Background' }
	] as const;

	interface Slider {
		key:
			| 'boxRadius'
			| 'fieldRadius'
			| 'border'
			| 'size'
			| 'cardOpacity'
			| 'siteImageOpacity'
			| 'cardImageOpacity'
			| 'gradientAngle'
			| 'cardGradientAngle';
		label: string;
		min: number;
		max: number;
		step: number;
		unit: string;
		when?: () => boolean;
	}

	const sliders: Slider[] = [
		{ key: 'boxRadius', label: 'Card radius', min: 0, max: 2.5, step: 0.125, unit: 'rem' },
		{ key: 'fieldRadius', label: 'Control radius', min: 0, max: 2, step: 0.125, unit: 'rem' },
		{ key: 'border', label: 'Border width', min: 0, max: 3, step: 0.5, unit: 'px' },
		{ key: 'size', label: 'Control size', min: 0.2, max: 0.35, step: 0.025, unit: 'rem' },
		{ key: 'cardOpacity', label: 'Card opacity', min: 20, max: 100, step: 5, unit: '%' },
		{
			key: 'siteImageOpacity',
			label: 'Website image opacity',
			min: 0,
			max: 100,
			step: 5,
			unit: '%',
			when: () => siteImage.active
		},
		{
			key: 'cardImageOpacity',
			label: 'Card image opacity',
			min: 0,
			max: 100,
			step: 5,
			unit: '%',
			when: () => cardImage.active
		},
		{
			key: 'gradientAngle',
			label: 'Gradient angle',
			min: 0,
			max: 360,
			step: 5,
			unit: '°',
			when: () => customization.gradient
		},
		{
			key: 'cardGradientAngle',
			label: 'Card gradient angle',
			min: 0,
			max: 360,
			step: 5,
			unit: '°',
			when: () => customization.cardGradient
		}
	];

	const visibleSliders = $derived(sliders.filter((s) => !s.when || s.when()));

	function onValueTyped(event: Event, slider: Slider) {
		const value = (event.currentTarget as HTMLInputElement).valueAsNumber;
		if (!Number.isFinite(value)) return;
		customization[slider.key] = value;
		applyCustomization();
	}

	// Clamping only on commit so partial entries like "0." aren't rewritten mid-typing
	function onValueCommitted(event: Event, slider: Slider) {
		const input = event.currentTarget as HTMLInputElement;
		const value = Number.isFinite(input.valueAsNumber)
			? input.valueAsNumber
			: customization[slider.key];
		customization[slider.key] = Math.min(slider.max, Math.max(slider.min, value));
		input.value = String(customization[slider.key]);
		applyCustomization();
	}

	const toggles = [
		{ key: 'depth', label: 'Depth shadows' },
		{ key: 'noise', label: 'Noise texture' }
	] as const;

	function hslHex(h: number, saturation: number, lightness: number) {
		h = ((h % 360) + 360) % 360;
		const a = (saturation * Math.min(lightness, 1 - lightness)) / 100;
		const f = (n: number) => {
			const k = (n + h / 30) % 12;
			const c = lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
			return Math.round(255 * c)
				.toString(16)
				.padStart(2, '0');
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	}

	const harmonies = [
		[0, 30, 180], // analogous + complement
		[0, 150, 210], // split-complementary
		[0, 120, 240], // triadic
		[0, 25, -25] // analogous
	];

	function randomize() {
		const hue = Math.random() * 360;
		const [p, s, a] = harmonies[Math.floor(Math.random() * harmonies.length)];
		customization.primary = hslHex(hue + p, 70, 0.55);
		customization.secondary = hslHex(hue + s, 55, 0.6);
		customization.accent = hslHex(hue + a, 70, 0.6);
		customization.base = hslHex(hue, 25, 0.15);
		for (const s of sliders.filter((s) => !s.when)) {
			const steps = Math.round((s.max - s.min) / s.step);
			const value = s.min + Math.floor(Math.random() * (steps + 1)) * s.step;
			customization[s.key] = Number(value.toFixed(3));
		}
		applyCustomization();
	}
</script>

<details class="customizer collapse-arrow bg-base-300 rounded-box collapse w-full">
	<summary class="collapse-title font-semibold">
		<i class="ph-bold ph-paint-brush mr-2"></i>Customize
	</summary>
	<div class="collapse-content gap-3 flex flex-col">
		<div class="gap-2 grid grid-cols-2">
			{#each colors as color (color.key)}
				<label class="gap-2 text-sm font-semibold flex items-center justify-between">
					{color.label}
					<input
						type="color"
						class="color-swatch"
						bind:value={customization[color.key]}
						oninput={applyCustomization}
					/>
				</label>
			{/each}
		</div>

		{#each visibleSliders as slider (slider.key)}
			<label class="gap-1 text-sm font-semibold flex flex-col">
				<span class="flex items-center justify-between">
					{slider.label}
					<span class="gap-1 text-neutral flex items-center">
						<input
							type="number"
							class="value-input"
							aria-label="{slider.label} value"
							min={slider.min}
							max={slider.max}
							step={slider.step}
							value={customization[slider.key]}
							oninput={(e) => onValueTyped(e, slider)}
							onchange={(e) => onValueCommitted(e, slider)}
						/>
						{slider.unit}
					</span>
				</span>
				<input
					type="range"
					class="range range-primary range-xs w-full"
					min={slider.min}
					max={slider.max}
					step={slider.step}
					bind:value={customization[slider.key]}
					oninput={applyCustomization}
				/>
			</label>
		{/each}

		{#each toggles as toggle (toggle.key)}
			<label class="text-sm font-semibold flex items-center justify-between">
				{toggle.label}
				<input
					type="checkbox"
					class="toggle toggle-primary toggle-sm"
					bind:checked={customization[toggle.key]}
					onchange={applyCustomization}
				/>
			</label>
		{/each}

		<label class="text-sm font-semibold flex items-center justify-between">
			Background gradient
			<input
				type="checkbox"
				class="toggle toggle-primary toggle-sm"
				bind:checked={customization.gradient}
				onchange={applyCustomization}
			/>
		</label>
		{#if customization.gradient}
			<div class="gap-2 grid grid-cols-2">
				<label class="gap-2 text-sm font-semibold flex items-center justify-between">
					From
					<input
						type="color"
						class="color-swatch"
						bind:value={customization.gradientFrom}
						oninput={applyCustomization}
					/>
				</label>
				<label class="gap-2 text-sm font-semibold flex items-center justify-between">
					To
					<input
						type="color"
						class="color-swatch"
						bind:value={customization.gradientTo}
						oninput={applyCustomization}
					/>
				</label>
			</div>
		{/if}

		<label class="text-sm font-semibold flex items-center justify-between">
			Card gradient
			<input
				type="checkbox"
				class="toggle toggle-primary toggle-sm"
				bind:checked={customization.cardGradient}
				onchange={applyCustomization}
			/>
		</label>
		{#if customization.cardGradient}
			<div class="gap-2 grid grid-cols-2">
				<label class="gap-2 text-sm font-semibold flex items-center justify-between">
					From
					<input
						type="color"
						class="color-swatch"
						bind:value={customization.cardGradientFrom}
						oninput={applyCustomization}
					/>
				</label>
				<label class="gap-2 text-sm font-semibold flex items-center justify-between">
					To
					<input
						type="color"
						class="color-swatch"
						bind:value={customization.cardGradientTo}
						oninput={applyCustomization}
					/>
				</label>
			</div>
		{/if}

		{#each imageFields as field (field.slot)}
			<div class="gap-1 text-sm font-semibold flex flex-col">
				{field.label}
				<div class="gap-2 flex items-center">
					<input
						type="file"
						accept="image/*"
						class="file-input file-input-sm flex-1"
						aria-label={field.label}
						onchange={(e) => onImagePicked(e, field.slot)}
					/>
					{#if field.state.active}
						<button
							type="button"
							class="btn btn-sm btn-ghost btn-square"
							aria-label="Remove {field.label.toLowerCase()}"
							onclick={() => clearImage(field.slot)}
						>
							<i class="ph-bold ph-trash"></i>
						</button>
					{/if}
				</div>
			</div>
		{/each}
		{#if imageError}<span class="text-error text-sm">{imageError}</span>{/if}

		<div class="gap-2 flex justify-end">
			<button type="button" class="btn btn-sm btn-ghost" onclick={randomize}>
				<i class="ph-bold ph-dice-five"></i>
				Random
			</button>
			<button type="button" class="btn btn-sm btn-ghost" onclick={resetCustomization}>
				<i class="ph-bold ph-arrow-counter-clockwise"></i>
				Reset
			</button>
		</div>
	</div>
</details>

<style>
	/* base.css's unlayered `* { padding: 0 }` zeroes DaisyUI collapse padding */
	.customizer {
		& summary {
			padding: 0.75rem 1rem;
			cursor: pointer;
		}
		& .collapse-content {
			padding: 0 1rem 1rem;
		}
	}

	.value-input {
		width: 4.5rem;
		padding: 0.125rem 0.375rem;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-field);
		background: transparent;
		color: var(--color-base-content);
		text-align: right;
	}

	.color-swatch {
		width: 2.5rem;
		height: 1.75rem;
		padding: 0;
		border: 0;
		border-radius: var(--radius-field);
		background: none;
		cursor: pointer;
	}
</style>
