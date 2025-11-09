<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { mapToolsStore } from '$lib/stores/mapTools.svelte';
	import type { Map as MapLibreMap } from 'maplibre-gl';

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;
	let previewMarker: maplibregl.Marker | null = null;

	// Tool type color mapping
	const toolColors: Record<string, string> = {
		'Ice sighting': '#e74c3c',
		'Homeless Shelter': '#3498db',
		'Food bank': '#27ae60'
	};

	interface LocationData {
		id: number;
		tool_type: string;
		latitude: number;
		longitude: number;
		note: string | null;
		agents: number | null;
		hours: string | null;
		city_name: string | null;
		created_at: string;
	}

	// Fetch locations from API
	async function loadLocations(): Promise<GeoJSON.FeatureCollection> {
		try {
			const response = await fetch('/api/locations');
			const result = await response.json();

			if (!result.success) {
				console.error('Failed to load locations');
				return { type: 'FeatureCollection', features: [] };
			}

			const features: GeoJSON.Feature[] = result.data.map((loc: LocationData) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [loc.longitude, loc.latitude]
				},
				properties: {
					id: loc.id,
					tool_type: loc.tool_type,
					note: loc.note,
					agents: loc.agents,
					hours: loc.hours,
					city_name: loc.city_name,
					created_at: loc.created_at
				}
			}));

			return {
				type: 'FeatureCollection',
				features
			};
		} catch (error) {
			console.error('Error loading locations:', error);
			return { type: 'FeatureCollection', features: [] };
		}
	}

	// Refresh locations on the map
	export async function refreshLocations() {
		if (!map) return;

		const locations = await loadLocations();
		const source = map.getSource('user-locations') as maplibregl.GeoJSONSource;
		if (source) {
			source.setData(locations);
		}
	}

	// Create a marker element for preview
	function createMarkerElement(toolType: string): HTMLDivElement {
		const el = document.createElement('div');
		el.className = 'custom-marker';
		el.style.width = '12px';
		el.style.height = '12px';
		el.style.borderRadius = '50%';
		el.style.backgroundColor = toolColors[toolType] || '#888';
		el.style.border = '2px solid white';
		el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
		el.style.cursor = 'pointer';
		return el;
	}

	// Remove preview marker when dialogue closes
	$effect(() => {
		if (!mapToolsStore.dialogueOpen && previewMarker) {
			previewMarker.remove();
			previewMarker = null;
		}
	});

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
					},
					'user-locations': {
						type: 'geojson',
						data: { type: 'FeatureCollection', features: [] }
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
			maxZoom: 14,
			pitch: 0, // Keep map flat, no 3D tilt
			bearing: 0, // Always point north
			pitchWithRotate: false, // Disable pitch control
			dragRotate: false, // Disable rotation
			touchPitch: false // Disable pitch on touch devices
		});

		// Add navigation controls (zoom only, no rotation/pitch)
		map.addControl(
			new maplibregl.NavigationControl({
				showCompass: false, // Hide compass/rotation control
				showZoom: true, // Keep zoom buttons
				visualizePitch: false // Don't show pitch indicator
			}),
			'top-right'
		);

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

			// Add user location pins (circles)
			map.addLayer({
				id: 'user-locations-circle',
				type: 'circle',
				source: 'user-locations',
				paint: {
					'circle-radius': 6,
					'circle-color': [
						'match',
						['get', 'tool_type'],
						'Ice sighting', '#e74c3c',
						'Homeless Shelter', '#3498db',
						'Food bank', '#27ae60',
						'#888' // default
					],
					'circle-stroke-width': 2,
					'circle-stroke-color': '#fff',
					'circle-opacity': 0.9
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

			// Add click interaction for user locations
			map.on('click', 'user-locations-circle', (e) => {
				// Prevent triggering map click handler when clicking on a location
				e.preventDefault();

				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const props = feature.properties;
					const { lng, lat } = e.lngLat;
					const { x, y } = e.point;

					// Open dialogue in view mode to show location details and comments
					mapToolsStore.openLocationView(props.id, { lng, lat }, { x, y });
				}
			});

			// Change cursor on hover for districts
			map.on('mouseenter', 'congress-fill', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = 'pointer';
				}
			});

			map.on('mouseleave', 'congress-fill', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = '';
				}
			});

			// Change cursor on hover for cities
			map.on('mouseenter', 'cities-circle', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = 'pointer';
				}
			});

			map.on('mouseleave', 'cities-circle', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = '';
				}
			});

			// Change cursor on hover for user locations
			map.on('mouseenter', 'user-locations-circle', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = 'pointer';
				}
			});

			map.on('mouseleave', 'user-locations-circle', () => {
				if (!mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = '';
				}
			});

			// Update cursor to crosshair when a tool is selected
			map.on('mousemove', () => {
				if (mapToolsStore.selectedTool) {
					map.getCanvas().style.cursor = 'crosshair';
				} else {
					// Reset to default cursor when no tool is selected
					map.getCanvas().style.cursor = '';
				}
			});

			// Handle map clicks to open dialogue when a tool is selected
			map.on('click', (e) => {
				if (mapToolsStore.selectedTool) {
					const { lng, lat } = e.lngLat;
					const { x, y } = e.point;

					// Remove existing preview marker
					if (previewMarker) {
						previewMarker.remove();
					}

					// Create and add preview marker at clicked location
					const markerEl = createMarkerElement(mapToolsStore.selectedTool);
					previewMarker = new maplibregl.Marker({ element: markerEl })
						.setLngLat([lng, lat])
						.addTo(map);

					mapToolsStore.openDialogue({ lng, lat }, { x, y });
				}
			});

			// Load and display user locations
			loadLocations().then((locations) => {
				const source = map.getSource('user-locations') as maplibregl.GeoJSONSource;
				if (source) {
					source.setData(locations);
				}
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
