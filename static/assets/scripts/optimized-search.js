/* Optimized Wiki Search - replaces SimpleJekyllSearch */
(function () {
	const SEARCH_JSON = '/search.json';
	const RESULTS_LIMIT = 24;
	const DEBOUNCE_MS = 150;

	let index = [];
	let debounceTimer = null;

	const input = document.getElementById('search-input');
	const resultsContainer = document.getElementById('results-container');
	const resultsWrapper = document.getElementById('results-fixstuff');

	if (!input || !resultsContainer || !resultsWrapper) return;

	async function loadIndex() {
		try {
			const res = await fetch(SEARCH_JSON);
			if (!res.ok) throw new Error(`Search index failed: ${res.status}`);
			index = await res.json();
		} catch (err) {
			console.warn('Search index unavailable:', err);
			index = [];
		}
	}

	function tokenize(text) {
		return text
			.toLowerCase()
			.split(/[\s\-_]+/)
			.filter(Boolean);
	}

	function score(item, queryTokens) {
		const titleTokens = tokenize(item.title);
		const descTokens = tokenize(item.desc || '');
		const authorTokens = tokenize(item.author || '');
		const allTitle = item.title.toLowerCase();
		const allDesc = (item.desc || '').toLowerCase();
		const allAuthor = (item.author || '').toLowerCase();

		let score = 0;
		let matchedTokens = 0;

		for (const token of queryTokens) {
			let tokenMatched = false;

			// Exact title word match (highest weight)
			if (titleTokens.includes(token)) {
				score += 100;
				tokenMatched = true;
			}
			// Title substring match
			else if (allTitle.includes(token)) {
				score += 50;
				tokenMatched = true;
			}
			// Description substring match
			else if (allDesc.includes(token)) {
				score += 25;
				tokenMatched = true;
			}
			// Author match
			else if (authorTokens.includes(token)) {
				score += 10;
				tokenMatched = true;
			}

			if (tokenMatched) matchedTokens++;
		}

		if (matchedTokens === 0) return 0;
		// Boost for matching all query tokens
		if (matchedTokens === queryTokens.length) score += 500;
		return score;
	}

	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function renderResults(query) {
		const q = query.toLowerCase().trim();
		const tokens = tokenize(q);
		resultsContainer.innerHTML = '';

		if (q.length === 0) {
			resultsWrapper.style.display = 'none';
			return;
		}

		const results = index
			.map((item) => ({ item, score: score(item, tokens) }))
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
			.slice(0, RESULTS_LIMIT);

		if (results.length === 0) {
			resultsContainer.innerHTML =
				'<div class="btn btn-wiki btn-wiki-stack">No results found!</div>';
			resultsWrapper.style.display = 'flex';
			return;
		}

		const fragment = document.createDocumentFragment();
		for (const { item } of results) {
			const a = document.createElement('a');
			a.className = 'btn btn-wiki btn-wiki-stack';
			a.href = item.url;
			a.innerHTML = `${escapeHtml(item.title)}${
				item.author ? `<div class="author">Written by ${escapeHtml(item.author)}</div>` : ''
			}`;
			fragment.appendChild(a);
		}
		resultsContainer.appendChild(fragment);
		resultsWrapper.style.display = 'flex';
	}

	function onInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			renderResults(input.value);
		}, DEBOUNCE_MS);
	}

	input.addEventListener('input', onInput);

	// Hide results when clicking outside
	document.addEventListener('click', (e) => {
		if (!resultsWrapper.contains(e.target) && e.target !== input) {
			resultsWrapper.style.display = 'none';
		}
	});

	// Show results on focus
	input.addEventListener('focus', () => {
		if (input.value.trim().length > 0) resultsWrapper.style.display = 'flex';
	});

	loadIndex();
})();
