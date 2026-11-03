# Camellia Wiki - Prototype

The Camellia Wiki has been reuploaded for its anniversary as a SvelteKit
prototype. It includes custom theming, background images, and account-free
comments. This version is available for a limited time.

## Project structure

- `src/routes` contains the SvelteKit pages and layouts.
- `src/articles` contains Markdown articles.
- `src/lib` contains shared components, data, and utilities.
- `static` contains public assets and files.

The project uses Svelte 5, Tailwind CSS 4, and DaisyUI 5.

## Development

```sh
bun install
bun run dev
```

## Checks and production preview

```sh
bun run check
bun run lint
bun run build
bun run preview
```
