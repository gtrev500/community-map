<script lang="ts">
	import { mapToolsStore } from '$lib/stores/mapTools.svelte';
	import TextInput from './input/TextInput.svelte';
	import NumberInput from './input/NumberInput.svelte';
	import DateInput from './input/DateInput.svelte';

	// Form data
	let note = $state('');
	let agents = $state(0);
	let hours = $state('');

	function handleSave() {
		const data = {
			tool: mapToolsStore.selectedTool,
			coordinates: mapToolsStore.clickedCoordinates,
			note,
			...(mapToolsStore.selectedTool === 'Ice' && { agents }),
			...(mapToolsStore.selectedTool === 'Food bank' && { hours })
		};

		console.log('Saving data:', data);

		// TODO: Send to API
		// Reset form and close dialogue
		resetForm();
		mapToolsStore.closeDialogue();
	}

	function handleCancel() {
		resetForm();
		mapToolsStore.closeDialogue();
	}

	function resetForm() {
		note = '';
		agents = 0;
		hours = '';
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
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center"
		onclick={handleCancel}
		role="button"
		tabindex="-1"
	>
		<!-- Modal -->
		<div
			class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
		>
			<h2 class="text-xl font-semibold mb-4">{mapToolsStore.selectedTool}</h2>

			<!-- Coordinates display -->
			{#if mapToolsStore.clickedCoordinates}
				<div class="mb-4 p-3 bg-gray-50 rounded text-sm">
					<p class="text-gray-600">
						<strong>Coordinates:</strong>
						{mapToolsStore.clickedCoordinates.lat.toFixed(6)},
						{mapToolsStore.clickedCoordinates.lng.toFixed(6)}
					</p>
				</div>
			{/if}

			<!-- Dynamic fields based on tool type -->
			<div class="flex flex-col gap-4 mb-6">
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
			<div class="flex gap-3 justify-end">
				<button
					class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
					onclick={handleCancel}
				>
					Cancel
				</button>
				<button
					class="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors"
					onclick={handleSave}
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
