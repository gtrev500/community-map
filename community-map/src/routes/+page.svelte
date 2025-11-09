<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ToolDialogue from '$lib/components/ToolDialogue.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import CTA from '$lib/components/CTA.svelte';
	import { fade } from 'svelte/transition';

	let mapComponent: Map;
	let showCTA = $state(true);

	function handleLaunch() {
		showCTA = false;
	}
</script>

<div class="relative w-full h-screen overflow-hidden">
	<!-- Map in background with blur when CTA is showing -->
	<div class="absolute w-full h-full transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
	     class:blur-[3px]={showCTA}
	     class:opacity-80={showCTA}
	     class:pointer-events-none={showCTA}>
		{#if !showCTA}
			<Toolbar />
		{/if}
		<Map bind:this={mapComponent} />
		<ToolDialogue {mapComponent} />
		{#if !showCTA}
			<Legend />
		{/if}
	</div>

	<!-- CTA Overlay -->
	{#if showCTA}
		<div class="absolute inset-0 flex items-center justify-center z-[1000] bg-transparent"
		     transition:fade={{ duration: 600 }}>
			<CTA on:launch={handleLaunch} />
		</div>
	{/if}
</div>
