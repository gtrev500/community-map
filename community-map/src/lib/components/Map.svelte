<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;

	onMount(() => {
		// California bounds - restricts viewport to California only
		const californiaBounds: maplibregl.LngLatBoundsLike = [
			[-124.48, 32.53], // Southwest coordinates [lng, lat]
			[-114.13, 42.01] // Northeast coordinates [lng, lat]
		];

		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					'carto-light': {
						type: 'raster',
						tiles: [
							'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
							'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
							'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
						],
						tileSize: 256,
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					},
					'congress-districts': {
						type: 'vector',
						tiles: ['http://localhost:3000/ca_congress_districts_119/{z}/{x}/{y}'],
						minzoom: 0,
						maxzoom: 14
					},
					'cities': {
						type: 'vector',
						tiles: ['http://localhost:3000/ca_cities/{z}/{x}/{y}'],
						minzoom: 0,
						maxzoom: 14
					}
				},
				layers: [
					{
						id: 'carto-light-layer',
						type: 'raster',
						source: 'carto-light',
						minzoom: 0,
						maxzoom: 22
					}
				],
				glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
			},
			bounds: californiaBounds,
			fitBoundsOptions: {
				padding: { top: 20, bottom: 20, left: 20, right: 20 }
			},
			maxBounds: californiaBounds, // Prevent panning outside California
			minZoom: 6,
			maxZoom: 14
		});

		// Add navigation controls
		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// Wait for map to load before adding layers
		map.on('load', () => {
			// Add congressional districts fill layer
			map.addLayer({
				id: 'congress-fill',
				type: 'fill',
				source: 'congress-districts',
				'source-layer': 'ca_congress_districts_119',
				paint: {
					'fill-color': '#088',
					'fill-opacity': 0.3
				}
			});

			// Add congressional districts border layer
			map.addLayer({
				id: 'congress-border',
				type: 'line',
				source: 'congress-districts',
				'source-layer': 'ca_congress_districts_119',
				paint: {
					'line-color': '#066',
					'line-width': 2
				}
			});

			// Add labels for districts
			map.addLayer({
				id: 'congress-labels',
				type: 'symbol',
				source: 'congress-districts',
				'source-layer': 'ca_congress_districts_119',
				layout: {
					'text-field': ['get', 'CONG119'],
					'text-font': ['Noto Sans Regular'],
					'text-size': 12
				},
				paint: {
					'text-color': '#333',
					'text-halo-color': '#fff',
					'text-halo-width': 1
				}
			});

			// Add cities layer (circles)
			map.addLayer({
				id: 'cities-circle',
				type: 'circle',
				source: 'cities',
				'source-layer': 'ca_cities',
				paint: {
					'circle-radius': [
						'interpolate',
						['linear'],
						['get', 'POP_MAX'],
						0,
						3,
						500000,
						6,
						5000000,
						12
					],
					'circle-color': '#e74c3c',
					'circle-opacity': 0.7,
					'circle-stroke-width': 1.5,
					'circle-stroke-color': '#c0392b'
				}
			});

			// Add city labels
			map.addLayer({
				id: 'cities-labels',
				type: 'symbol',
				source: 'cities',
				'source-layer': 'ca_cities',
				layout: {
					'text-field': ['get', 'NAME'],
					'text-font': ['Noto Sans Regular'],
					'text-size': [
						'interpolate',
						['linear'],
						['get', 'POP_MAX'],
						0,
						10,
						1000000,
						12,
						5000000,
						14
					],
					'text-offset': [0, 1.5],
					'text-anchor': 'top'
				},
				paint: {
					'text-color': '#2c3e50',
					'text-halo-color': '#fff',
					'text-halo-width': 1.5
				}
			});

			// Add click interaction
			map.on('click', 'congress-fill', (e) => {
				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const { CONG119, STATE, DISTRICT } = feature.properties;

					new maplibregl.Popup()
						.setLngLat(e.lngLat)
						.setHTML(
							`
							<div style="padding: 8px;">
								<h3 style="margin: 0 0 8px 0; font-weight: 600;">${CONG119}</h3>
								<p style="margin: 4px 0;"><strong>State:</strong> ${STATE}</p>
								<p style="margin: 4px 0;"><strong>District:</strong> ${DISTRICT}</p>
							</div>
						`
						)
						.addTo(map);
				}
			});

			// Add click interaction for cities
			map.on('click', 'cities-circle', (e) => {
				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const { NAME, POP_MAX } = feature.properties;
					const popFormatted = POP_MAX
						? new Intl.NumberFormat('en-US').format(POP_MAX)
						: 'Unknown';

					new maplibregl.Popup()
						.setLngLat(e.lngLat)
						.setHTML(
							`
							<div style="padding: 8px;">
								<h3 style="margin: 0 0 8px 0; font-weight: 600;">${NAME}</h3>
								<p style="margin: 4px 0;"><strong>Population:</strong> ${popFormatted}</p>
							</div>
						`
						)
						.addTo(map);
				}
			});

			// Change cursor on hover for districts
			map.on('mouseenter', 'congress-fill', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'congress-fill', () => {
				map.getCanvas().style.cursor = '';
			});

			// Change cursor on hover for cities
			map.on('mouseenter', 'cities-circle', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'cities-circle', () => {
				map.getCanvas().style.cursor = '';
			});
		});

		return () => {
			map.remove();
		};
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map"></div>
</div>

<style>
	.map-wrapper {
		width: 100%;
		height: 100vh;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	:global(.maplibregl-popup-content) {
		padding: 0;
		border-radius: 4px;
	}
</style>
