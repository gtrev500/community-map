<script lang="ts">
	import { mapToolsStore } from '$lib/stores/mapTools.svelte';
	import TextInput from './input/TextInput.svelte';
	import NumberInput from './input/NumberInput.svelte';
	import DateInput from './input/DateInput.svelte';
	import type Map from './Map.svelte';

	interface Props {
		mapComponent?: Map;
	}

	let { mapComponent }: Props = $props();

	// Form data (for creating locations)
	let note = $state('');
	let agents = $state(0);
	let hours = $state('');

	// View mode data (for viewing locations)
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

	interface CommentData {
		id: number;
		comment_text: string;
		author_name: string | null;
		created_at: string;
		updated_at: string;
	}

	let locationData = $state<LocationData | null>(null);
	let comments = $state<CommentData[]>([]);
	let newComment = $state('');

	// Loading and error states
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	let dialogueElement: HTMLDivElement;

	// Load location data and comments when dialogue opens in view mode
	$effect(() => {
		if (mapToolsStore.dialogueOpen && mapToolsStore.dialogueMode === 'view-location' && mapToolsStore.selectedLocationId) {
			loadLocationData(mapToolsStore.selectedLocationId);
		}
	});

	// Calculate position with offset and boundary checking
	let dialogueStyle = $derived.by(() => {
		if (!mapToolsStore.screenPosition) return '';

		const offset = 10; // pixels to offset from cursor
		let x = mapToolsStore.screenPosition.x + offset;
		let y = mapToolsStore.screenPosition.y + offset;

		// Adjust if dialogue would go off screen
		if (dialogueElement) {
			const rect = dialogueElement.getBoundingClientRect();
			if (x + rect.width > window.innerWidth) {
				x = mapToolsStore.screenPosition.x - rect.width - offset;
			}
			if (y + rect.height > window.innerHeight) {
				y = mapToolsStore.screenPosition.y - rect.height - offset;
			}
		}

		return `left: ${x}px; top: ${y}px;`;
	});

	async function handleSave() {
		if (!mapToolsStore.clickedCoordinates) return;

		const data = {
			tool: mapToolsStore.selectedTool,
			coordinates: [
				mapToolsStore.clickedCoordinates.lng,
				mapToolsStore.clickedCoordinates.lat
			] as [number, number],
			note: note || undefined,
			...(mapToolsStore.selectedTool === 'Ice' && { agents }),
			...(mapToolsStore.selectedTool === 'Food bank' && { hours })
		};

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/locations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Failed to save location' }));
				throw new Error(errorData.message || 'Failed to save location');
			}

			const result = await response.json();
			console.log('Location saved successfully:', result);

			// Refresh map to show new location
			if (mapComponent) {
				await mapComponent.refreshLocations();
			}

			// Reset form and close dialogue
			resetForm();
			mapToolsStore.closeDialogue();
		} catch (err) {
			console.error('Error saving location:', err);
			error = err instanceof Error ? err.message : 'Failed to save location';
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		resetForm();
		mapToolsStore.closeDialogue();
	}

	function resetForm() {
		note = '';
		agents = 0;
		hours = '';
		newComment = '';
		error = null;
		isLoading = false;
		locationData = null;
		comments = [];
	}

	// Load location data and comments
	async function loadLocationData(locationId: number) {
		isLoading = true;
		error = null;

		try {
			// Fetch location details and comments in parallel
			const [locResponse, commentsResponse] = await Promise.all([
				fetch(`/api/locations`),
				fetch(`/api/comments?location_id=${locationId}`)
			]);

			if (!locResponse.ok || !commentsResponse.ok) {
				throw new Error('Failed to load location data');
			}

			const locResult = await locResponse.json();
			const commentsResult = await commentsResponse.json();

			// Find the specific location
			const location = locResult.data.find((loc: LocationData) => loc.id === locationId);
			if (!location) {
				throw new Error('Location not found');
			}

			locationData = location;
			comments = commentsResult.data;
		} catch (err) {
			console.error('Error loading location data:', err);
			error = err instanceof Error ? err.message : 'Failed to load location data';
		} finally {
			isLoading = false;
		}
	}

	// Submit a new comment
	async function handleAddComment() {
		if (!newComment.trim() || !mapToolsStore.selectedLocationId) return;

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					location_id: mapToolsStore.selectedLocationId,
					comment_text: newComment.trim()
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Failed to add comment' }));
				throw new Error(errorData.message || 'Failed to add comment');
			}

			const result = await response.json();
			console.log('Comment added successfully:', result);

			// Add new comment to the list
			comments = [result.data, ...comments];
			newComment = '';
		} catch (err) {
			console.error('Error adding comment:', err);
			error = err instanceof Error ? err.message : 'Failed to add comment';
		} finally {
			isLoading = false;
		}
	}

	// Close on escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mapToolsStore.dialogueOpen}
	<!-- Dialogue positioned at cursor -->
	<div
		bind:this={dialogueElement}
		class="fixed z-30 bg-white rounded shadow-md p-3 border border-gray-200 max-h-[80vh] overflow-y-auto"
		class:w-64={mapToolsStore.dialogueMode === 'create-location'}
		class:w-80={mapToolsStore.dialogueMode === 'view-location'}
		style={dialogueStyle}
		role="dialog"
		tabindex="-1"
	>
		<!-- Close X button (top right) -->
		<button
			onclick={handleCancel}
			class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
			aria-label="Close"
			title="Close"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-3.5 h-3.5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>

		{#if mapToolsStore.dialogueMode === 'create-location'}
			<!-- CREATE MODE: New Location Form -->
			<h3 class="text-sm font-semibold mb-2 pr-6">{mapToolsStore.selectedTool}</h3>

			<!-- Coordinates display -->
			{#if mapToolsStore.clickedCoordinates}
				<div class="mb-2 p-1.5 bg-gray-50 rounded text-xs">
					<p class="text-gray-600">
						<strong>Coordinates:</strong>
						{mapToolsStore.clickedCoordinates.lat.toFixed(6)},
						{mapToolsStore.clickedCoordinates.lng.toFixed(6)}
					</p>
				</div>
			{/if}

			<!-- Error message -->
			{#if error}
				<div class="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
					{error}
				</div>
			{/if}

			<!-- Dynamic fields based on tool type -->
			<div class="flex flex-col gap-2 mb-3">
				{#if mapToolsStore.selectedTool === 'Ice'}
					<TextInput label="Note" bind:value={note} placeholder="Enter note..." />
					<NumberInput label="Agents" bind:value={agents} min={0} placeholder="Number of agents" />
				{:else if mapToolsStore.selectedTool === 'Food bank'}
					<DateInput label="Hours" bind:value={hours} />
					<TextInput label="Note" bind:value={note} placeholder="Enter note..." />
				{:else if mapToolsStore.selectedTool === 'Homeless Shelter'}
					<TextInput label="Note" bind:value={note} placeholder="Enter note..." />
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex gap-2 justify-end">
				<button
					class="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					onclick={handleCancel}
					disabled={isLoading}
				>
					Cancel
				</button>
				<button
					class="px-2.5 py-1 text-xs bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					onclick={handleSave}
					disabled={isLoading}
				>
					{isLoading ? 'Saving...' : 'Save'}
				</button>
			</div>

		{:else if mapToolsStore.dialogueMode === 'view-location' && locationData}
			<!-- VIEW MODE: Location Details & Comments -->
			<h3 class="text-sm font-semibold mb-2 pr-6">{locationData.tool_type}</h3>

			<!-- Location Details -->
			<div class="mb-3 p-2 bg-gray-50 rounded text-xs space-y-1">
				{#if locationData.city_name}
					<p class="text-gray-700"><strong>City:</strong> {locationData.city_name}</p>
				{/if}
				{#if locationData.note}
					<p class="text-gray-700"><strong>Note:</strong> {locationData.note}</p>
				{/if}
				{#if locationData.agents !== null && locationData.tool_type === 'Ice'}
					<p class="text-gray-700"><strong>Agents:</strong> {locationData.agents}</p>
				{/if}
				{#if locationData.hours && locationData.tool_type === 'Food bank'}
					<p class="text-gray-700"><strong>Hours:</strong> {locationData.hours}</p>
				{/if}
				<p class="text-gray-500 text-xxs">
					<strong>Added:</strong> {new Date(locationData.created_at).toLocaleDateString()}
				</p>
			</div>

			<!-- Error message -->
			{#if error}
				<div class="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
					{error}
				</div>
			{/if}

			<!-- Comments Section -->
			<div class="mb-3">
				<h4 class="text-xs font-semibold mb-2 text-gray-700">
					Comments ({comments.length})
				</h4>

				<!-- Comment List -->
				{#if comments.length > 0}
					<div class="space-y-2 mb-2 max-h-40 overflow-y-auto">
						{#each comments as comment}
							<div class="p-2 bg-blue-50 rounded text-xs">
								<p class="text-gray-800">{comment.comment_text}</p>
								<p class="text-gray-500 text-xxs mt-1">
									{new Date(comment.created_at).toLocaleString()}
								</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-xs text-gray-500 mb-2 italic">No comments yet</p>
				{/if}

				<!-- Add Comment Form -->
				<div class="space-y-2">
					<TextInput
						label="Add Comment"
						bind:value={newComment}
						placeholder="Enter your comment..."
					/>
					<button
						class="w-full px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						onclick={handleAddComment}
						disabled={isLoading || !newComment.trim()}
					>
						{isLoading ? 'Adding...' : 'Add Comment'}
					</button>
				</div>
			</div>

			<!-- Close Button -->
			<div class="flex justify-end">
				<button
					class="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
					onclick={handleCancel}
				>
					Close
				</button>
			</div>
		{/if}
	</div>
{/if}
