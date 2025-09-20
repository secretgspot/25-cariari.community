<script>
	let { size = '90px', color = 'currentColor' } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 166 166" fill="none">
	<defs>
		<linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
			<animateTransform
				attributeName="gradientTransform"
				type="translate"
				from="-1 0"
				to="1 0"
				dur="3s"
				repeatCount="indefinite" />
			<stop offset="0%" style="stop-color: var(--brand)" />
			<stop offset="50%" style="stop-color: var(--surface-2)" />
			<stop offset="100%" style="stop-color: var(--brand)" />
		</linearGradient>
	</defs>
	<g id="Group 2">
		<circle
			id="Ellipse 7"
			cx="83"
			cy="82.5202"
			r="57.2736"
			stroke="url(#shimmer)"
			stroke-width="3"
			fill="none" />
		<path
			id="Union"
			d="M166 0C125.5 47.9769 119.5 67.6474 119.5 91.1561C93.9 105.741 84.5 147.129 83 166C81.5 147.129 72.1 105.741 46.5 91.1561C46.5 67.6474 40.5 47.9769 0 0C37.2 29.9376 70.8333 63.6493 83 76.763C95.1667 63.6493 128.8 29.9376 166 0Z"
			fill={color} />
	</g>
</svg>

<style>
	svg {
		display: inline-block;
		vertical-align: middle;
	}
</style>
