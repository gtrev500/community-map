<script lang="ts">
	interface Props {
		label: string;
		value?: string;
		onchange?: (value: string) => void;
	}

	let { label, value = $bindable(''), onchange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}
</script>

<div class="flex flex-col gap-1.5">
	<label class="text-sm font-medium text-gray-700">{label}</label>
	<input
		type="datetime-local"
		{value}
		oninput={handleInput}
		class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
	/>
</div>
