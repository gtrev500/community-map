<script lang="ts">
	const toolTypes = [
		{ name: 'Ice', color: '#e74c3c'},
		{ name: 'Homeless Shelter', color: '#3498db'},
		{ name: 'Food bank', color: '#27ae60' }
	];
</script>

<div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-20">
	<h3 class="text-sm font-semibold mb-2 text-gray-700">Locations</h3>
	<div class="flex flex-col gap-1.5">
		{#each toolTypes as tool}
			<div class="flex items-center gap-2 text-xs">
				<div
					class="w-3 h-3 rounded-full border-2 border-white"
					style="background-color: {tool.color}; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"
				></div>
				<span class="text-gray-700">{tool.name}</span>
			</div>
		{/each}
	</div>
</div>
