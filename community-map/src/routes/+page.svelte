<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ToolDialogue from '$lib/components/ToolDialogue.svelte';
	import Legend from '$lib/components/Legend.svelte';

	let mapComponent: Map;
</script>

<div class="relative w-full h-screen">
	<Toolbar />
	<Map bind:this={mapComponent} />
	<ToolDialogue {mapComponent} />
	<Legend />
</div>
