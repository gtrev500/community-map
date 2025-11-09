<script lang="ts">
	import ToolButton from './ToolButton.svelte';
	import { mapToolsStore, type ToolType } from '$lib/stores/mapTools.svelte';

	const tools: Exclude<ToolType, null>[] = ['Ice sighting', 'Homeless Shelter', 'Food bank'];

	function handleToolClick(tool: Exclude<ToolType, null>) {
		if (mapToolsStore.selectedTool === tool) {
			mapToolsStore.clearSelection();
		} else {
			mapToolsStore.selectTool(tool);
		}
	}
</script>

<div class="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-row gap-2">
	{#each tools as tool}
		<ToolButton
			label={tool}
			selected={mapToolsStore.selectedTool === tool}
			onclick={() => handleToolClick(tool)}
		/>
	{/each}
</div>
