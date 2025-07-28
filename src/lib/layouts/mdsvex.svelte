<script>
	let { children } = $props();
</script>

<article class="prose">
	{@render children?.()}
</article>

<style>
	.prose {
		max-width: none;
		line-height: 1.7;
		color: #374151;
	}

	.prose :global(h1) {
		font-size: 2.25rem;
		font-weight: 800;
		color: #111827;
		margin-top: 0;
		margin-bottom: 0.8888889em;
		line-height: 1.1111111;
	}

	.prose :global(h2) {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin-top: 2em;
		margin-bottom: 1em;
		line-height: 1.3333333;
	}

	.prose :global(h3) {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-top: 1.6em;
		margin-bottom: 0.6em;
		line-height: 1.6;
	}

	.prose :global(p) {
		margin-top: 1.25em;
		margin-bottom: 1.25em;
	}

	.prose :global(a) {
		color: #2563eb;
		text-decoration: underline;
		font-weight: 500;
	}

	.prose :global(a:hover) {
		color: #1d4ed8;
	}

	.prose :global(strong) {
		color: #111827;
		font-weight: 600;
	}

	.prose :global(em) {
		color: #111827;
		font-style: italic;
	}

	.prose :global(code) {
		color: #111827;
		font-weight: 500;
		font-size: 0.875em;
		background-color: #f3f4f6;
		padding: 0.25em 0.375em;
		border-radius: 0.25rem;
	}

	.prose :global(ul) {
		margin-top: 1.25em;
		margin-bottom: 1.25em;
		padding-left: 1.625em;
	}

	.prose :global(ol) {
		margin-top: 1.25em;
		margin-bottom: 1.25em;
		padding-left: 1.625em;
	}

	.prose :global(li) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	.prose :global(blockquote) {
		font-weight: 500;
		font-style: italic;
		color: #111827;
		border-left-width: 0.25rem;
		border-left-color: #e5e7eb;
		quotes: '"\\201C""\\201D""\\2018""\\2019"';
		margin-top: 1.6em;
		margin-bottom: 1.6em;
		padding-left: 1em;
	}

	.prose :global(img) {
		margin-top: 2em;
		margin-bottom: 2em;
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
	}

	.prose :global(pre) {
		color: #e5e7eb;
		background-color: #374151;
		overflow-x: auto;
		font-weight: 400;
		font-size: 0.875em;
		line-height: 1.7142857;
		margin-top: 1.7142857em;
		margin-bottom: 1.7142857em;
		border-radius: 0.375rem;
		padding: 0.8571429em 1.1428571em;
	}

	.prose :global(pre code) {
		background-color: transparent;
		border-width: 0;
		border-radius: 0;
		padding: 0;
		font-weight: inherit;
		color: inherit;
		font-size: inherit;
		font-family: inherit;
		line-height: inherit;
	}

	.prose :global(table) {
		width: 100%;
		table-layout: auto;
		text-align: left;
		margin-top: 2em;
		margin-bottom: 2em;
		font-size: 0.875em;
		line-height: 1.7142857;
		border-collapse: collapse;
	}

	.prose :global(thead) {
		border-bottom-width: 1px;
		border-bottom-color: #d1d5db;
	}

	.prose :global(thead th) {
		color: #111827;
		font-weight: 600;
		vertical-align: bottom;
		padding-right: 0.5714286em;
		padding-bottom: 0.5714286em;
		padding-left: 0.5714286em;
	}

	.prose :global(tbody tr) {
		border-bottom-width: 1px;
		border-bottom-color: #e5e7eb;
	}

	.prose :global(tbody td) {
		vertical-align: baseline;
		padding: 0.5714286em;
	}
</style>
