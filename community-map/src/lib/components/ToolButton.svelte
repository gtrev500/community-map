<script lang="ts">
	import type { ToolType } from '$lib/stores/mapTools.svelte';

	interface Props {
		label: Exclude<ToolType, null>; // Tool type excluding null
		selected?: boolean;
		onclick?: () => void;
	}

	let { label, selected = false, onclick }: Props = $props();
</script>

<button
	class="px-4 py-2 border-2 font-medium text-sm rounded transition-all duration-200 whitespace-nowrap w-full
		{selected
		? 'bg-teal-700 text-white border-teal-700 hover:bg-teal-800 hover:border-teal-800'
		: 'bg-white text-gray-800 border-gray-800 hover:bg-gray-50'}"
	onclick={onclick}
>
	{label}
</button>
