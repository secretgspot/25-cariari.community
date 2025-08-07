<script>
	import { MapLibre, NavigationControl, ScaleControl } from 'svelte-maplibre-gl';
</script>

<MapLibre
	class="h-[55vh] min-h-[300px] map"
	style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
	zoom="13"
	minZoom="13"
	maxZoom="17"
	center={{ lng: -84.16400029415285, lat: 9.970881419133026 }}
	maxBounds={[
		[-84.199448, 9.9465288],
		[-84.128766, 9.9970008],
	]}
	attributionControl={false}>
	<NavigationControl />
	<ScaleControl />
</MapLibre>

<style>
	:global(.map) {
		width: 100%;
		height: 100%;
		aspect-ratio: 1;
	}
</style>
