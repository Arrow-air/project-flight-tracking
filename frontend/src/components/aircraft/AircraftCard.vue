<template>
	<div class="card bg-base-100 shadow h-full">
		<div class="card-body">
			<div class="flex items-start justify-between gap-2">
				<h3 class="card-title truncate">{{ aircraft.name || 'Unnamed aircraft' }}</h3>
				<span class="badge badge-outline">{{ aircraft.aircraftType || '—' }}</span>
			</div>
			<p class="text-sm text-base-content/70">Serial: {{ aircraft.serialNumber }}</p>
			<p v-if="aircraft.notes" class="text-sm line-clamp-2">{{ aircraft.notes }}</p>
			<div class="card-actions justify-end mt-2">
				<slot name="actions"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AircraftData } from '@/api/rest/aircraft.api';

defineProps<{ aircraft: AircraftData }>()
</script>

<style scoped></style>


