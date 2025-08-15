<template>
	<section class="max-w-6xl mx-auto px-6 py-8">
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">Flights</h1>
				<p class="text-base-content/70">Your individual flight legs</p>
			</div>
		</div>

		<FlightLegsSection />
	</section>
</template>

<script setup lang="ts">
import FlightLegsSection from '@/components/flight_legs/FlightLegsSection.vue';
</script>

<style scoped></style>


