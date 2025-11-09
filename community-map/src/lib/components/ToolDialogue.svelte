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

	// Form data
	let note = $state('');
	let agents = $state(0);
	let hours = $state('');

	// Loading and error states
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	let dialogueElement: HTMLDivElement;

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
		error = null;
		isLoading = false;
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
		class="fixed z-30 bg-white rounded shadow-md p-3 w-64 border border-gray-200"
		style={dialogueStyle}
		role="dialog"
		tabindex="-1"
	>
		<h3 class="text-sm font-semibold mb-2">{mapToolsStore.selectedTool}</h3>

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
	</div>
{/if}
