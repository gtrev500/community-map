<script lang="ts">
	interface Props {
		label: string;
		value?: number;
		placeholder?: string;
		min?: number;
		max?: number;
		onchange?: (value: number) => void;
	}

	let { label, value = $bindable(0), placeholder = '', min, max, onchange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = parseInt(target.value) || 0;
		onchange?.(value);
	}
</script>

<div class="flex flex-col gap-1">
	<label class="text-xs font-medium text-gray-700">{label}</label>
	<input
		type="number"
		{value}
		{placeholder}
		{min}
		{max}
		oninput={handleInput}
		class="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
	/>
</div>
