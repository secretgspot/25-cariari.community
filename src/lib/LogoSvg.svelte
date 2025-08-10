<script>
	/** @type {{animate?: boolean, ring?: boolean, kind?: string, size?: number, fixed?: boolean, time?: number, invert?: boolean}} */
	let {
		animate = false,
		ring = true,
		kind = 'gold',
		size = 36,
		fixed = false,
		time = 9,
		invert = false,
		...rest
	} = $props();
</script>

<svg
	class="logo"
	class:fixed
	class:invert
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	viewBox="0 0 166 166"
	width={size}
	height={size}
	{...rest}>
	<defs>
		<!-- Da gradient -->
		<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">
			<stop offset="0%" style="stop-color:#f8e9a1;" />
			<stop offset="25%" style="stop-color:#e0c063;" />
			<stop offset="50%" style="stop-color:#f1d166;" />
			<stop offset="75%" style="stop-color:#d4af37;" />
			<stop offset="100%" style="stop-color:#f8e9a1;" />
		</linearGradient>

		<pattern
			id="pattern"
			x="0"
			y="0"
			width="220%"
			height="220%"
			patternUnits="userSpaceOnUse">
			<circle cx="83" cy="82.5202" r="57.2736" stroke-width="3" fill="url(#gradient)">
				<animateTransform
					attributeType="XML"
					attributeName="transform"
					type="rotate"
					from="360"
					to="0"
					begin="0"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</circle>
			<rect x="0" y="0" width="220%" height="220%" fill="url(#gradient)">
				<animate
					attributeType="XML"
					attributeName="x"
					from="0"
					to="220%"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</rect>
			<rect x="-220%" y="0" width="220%" height="220%" fill="url(#gradient)">
				<animate
					attributeType="XML"
					attributeName="x"
					from="-220%"
					to="0"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</rect>
		</pattern>
	</defs>
	<title>Cariari.Community</title>
	<g id="bat" fill="url(#pattern)">
		<path
			class="cls-1 {kind}"
			d="M166 0C125.5 47.9769 119.5 67.6474 119.5 91.1561C93.9 105.741 84.5 147.129 83 166C81.5 147.129 72.1 105.741 46.5 91.1561C46.5 67.6474 40.5 47.9769 0 0C37.2 29.9376 70.8333 63.6493 83 76.763C95.1667 63.6493 128.8 29.9376 166 0Z"
			transform="translate(-1 -1)" />
	</g>
	{#if ring}
		<g id="ring" stroke="url(#pattern)">
			<circle class="cls-2 {kind}" cx="83" cy="82.5202" r="57.2736" stroke-width="3" />
		</g>
	{/if}
</svg>

<style>
	.logo {
		z-index: 10;
		cursor: default;
	}
	.fixed {
		position: fixed;
		top: var(--size-1);
		left: var(--size-1);
	}

	.cls-2 {
		fill: none;
		stroke-width: 6px;
	}
	.cls-2.bw {
		stroke: var(--text-1, #231f20);
	}
	.cls-1 {
		fill-rule: evenodd;
	}
	.cls-1.bw {
		fill: var(--text-1, #231f20);
	}
	.invert {
		mix-blend-mode: difference;
	}
</style>
