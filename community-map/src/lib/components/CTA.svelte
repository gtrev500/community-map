<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleLaunch() {
		dispatch('launch');
	}
</script>

<section class="w-full py-24 bg-transparent">
	<div class="max-w-screen-xl mx-auto px-4">
		<div class="max-w-4xl mx-auto text-center p-12 bg-white/85 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
			<div class="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-[hsl(25,95%,65%)]/10 border border-[hsl(25,95%,65%)]/20">
				<svg
					class="w-4 h-4 text-[hsl(25,95%,65%)]"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
				</svg>
				<span class="text-sm font-medium text-[hsl(25,95%,65%)]">Join Our Community</span>
			</div>

			<h2 class="text-4xl md:text-5xl font-bold mb-6 text-[hsl(210,15%,15%)] leading-tight">
				Ready to Find the Support You Need?
			</h2>

			<p class="text-xl text-[hsl(210,12%,50%)] mb-10 leading-relaxed max-w-2xl mx-auto">
				Start exploring our interactive map to discover resources in your area.
				Community-maintained map of assistance.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
				<button
					class="text-lg px-10 py-6 rounded-lg font-medium cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 bg-[hsl(210,15%,15%)] text-white shadow-[0_4px_16px_-4px_hsl(210,15%,15%,0.12)] hover:bg-[hsl(210,15%,20%)] hover:shadow-[0_8px_24px_-8px_hsl(210,15%,15%,0.2)] hover:scale-105 border-none"
					on:click={handleLaunch}
				>
					<svg
						class="w-5 h-5"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
					Launch Resource Finder
				</button>
				<button class="text-lg px-10 py-6 rounded-lg font-medium cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 bg-transparent text-[hsl(210,15%,15%)] border-2 border-[hsl(210,20%,90%)] hover:bg-[hsl(210,20%,96%)]">
					Learn More
				</button>
			</div>

			<p class="text-sm text-[hsl(210,12%,50%)] mt-8">
				Available 24/7 • Completely Free • Confidential
			</p>
		</div>
	</div>
</section>
