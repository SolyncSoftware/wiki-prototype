<script>
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>All Tests | Camellia Wiki</title>
</svelte:head>

<main>
	<div id="notAFullTitleContainer">
		<h1>All Tests</h1>
	</div>
	<div class="cardBackground">
		<div class="card">
			<div class="cardHeader">
				<h2>You will find Tests Here</h2>
			</div>
			<div class="cardContents">
				<p>
					Located at the bottom are useful tests used throughout this site. Click a buttons to view
					the page.
				</p>
			</div>
			<div class="centerItem">
				<nav id="navigationButtons">
					<div class="btn">
						<a href={resolve('/tests/oneCardTest')}>One Card Test</a>
					</div>
					<div class="btn">
						<a href={resolve('/tests/twoCardTest')}>Two Card Test</a>
					</div>
					<div class="btn">
						<a href={resolve('/tests/pictureTest')}>Picture Test</a>
					</div>
					<div class="btn">
						<a href={resolve('/tests/pictureWrapTest')}>Picture Wrap Test</a>
					</div>
				</nav>
			</div>
		</div>
	</div>
</main>
