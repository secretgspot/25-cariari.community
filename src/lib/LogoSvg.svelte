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
	viewBox="0 0 512 512"
	width={size}
	height={size}
	{...rest}>
	<title>Cariari.Community</title>

	<defs>
		<!-- Gold gradient definition -->
		<linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0">
			<stop offset="0%" stop-color="#f8e9a1" />
			<stop offset="25%" stop-color="#e0c063" />
			<stop offset="50%" stop-color="#f1d166" />
			<stop offset="75%" stop-color="#d4af37" />
			<stop offset="100%" stop-color="#f8e9a1" />
		</linearGradient>

		<!-- Animated pattern with rotating circle and sliding rectangles -->
		<pattern
			id="animatedPattern"
			x="0"
			y="0"
			width="220%"
			height="220%"
			patternUnits="userSpaceOnUse">
			<!-- Rotating circle -->
			<circle cx="256" cy="300" r="180" stroke-width="3" fill="url(#goldGradient)">
				<animateTransform
					attributeName="transform"
					type="rotate"
					values="360;0"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</circle>

			<!-- Sliding rectangle (right to left) -->
			<rect x="0" y="0" width="220%" height="220%" fill="url(#goldGradient)">
				<animate
					attributeName="x"
					values="0;220%"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</rect>

			<!-- Sliding rectangle (left to center) -->
			<rect x="-220%" y="0" width="220%" height="220%" fill="url(#goldGradient)">
				<animate
					attributeName="x"
					values="-220%;0"
					dur="{time}s"
					repeatCount={animate ? 'indefinite' : 0} />
			</rect>
		</pattern>
	</defs>

	<!-- Main bat shape -->
	<g id="batShape" fill="url(#animatedPattern)">
		<path
			class="shape {kind}"
			transform="translate(-1 -1)"
			d="M488 0c-16.92 73.66-24.52 84.53-51.96 126.8-102.7 158.18-87 148.52-87 199.24C295.87 341.49 264.86 456.45 256 512c-8.86-55.55-39.88-170.5-93.04-185.96 0-50.72 15.7-41.06-87-199.25C48.52 84.53 40.92 73.66 24 0c20.94 51.92 39.88 82.11 118.42 169.06L256 287.4l113.58-118.34C448.13 82.1 467.06 51.92 488 0Z" />
	</g>

	<!-- Optional ring around the logo -->
	{#if ring}
		<g id="ringShape" stroke="url(#animatedPattern)">
			<circle
				class="ring {kind}"
				cx="256"
				cy="300"
				r="180"
				stroke-width="3"
				fill="none" />
		</g>
	{/if}
</svg>

<style>
	.logo {
		z-index: 10;
		cursor: default;
		&.fixed {
			position: fixed;
			top: var(--size-1);
			left: var(--size-1);
		}
		&.invert {
			mix-blend-mode: difference;
		}
	}

	.ring {
		fill: none;
		stroke-width: 6px;
		&.bw {
			stroke: var(--text-1);
		}
	}
	.shape {
		fill-rule: evenodd;
		&.bw {
			fill: var(--text-1);
		}
	}
</style>
