<template>
	<RouterLink
		class="card bg-base-100 shadow block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:ring-2 hover:ring-primary/40"
		:to="{ name: 'Flight Record', params: { flight_id: leg.id } }"
	>
		<div class="card-body">
			<div class="flex items-start justify-between gap-3">
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<h3 class="card-title text-base">{{ leg.title || 'Flight leg' }}</h3>
						<span v-if="leg.location" class="badge badge-outline">{{ leg.location }}</span>
					</div>
					<div class="text-xs text-base-content/70">
						<span>Created: {{ formatDate(leg.createdAt) }}</span>
						<span class="mx-1">·</span>
						<span>Updated: {{ formatDate(leg.updatedAt) }}</span>
					</div>
				</div>
				<div class="card-actions">
					<slot name="actions"></slot>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3 text-sm mt-2">
				<div>Altitude: <span class="font-medium">{{ leg.altitudeM ?? '—' }}</span> m</div>
				<div>Temp: <span class="font-medium">{{ leg.tempC ?? '—' }}</span> °C</div>
			</div>
			<p v-if="leg.description" class="text-sm mt-2 whitespace-pre-wrap">{{ leg.description }}</p>
		</div>
	</RouterLink>
</template>

<script setup lang="ts">
import type { FlightLegData } from '@/api/rest/flight_legs.api'

defineProps<{ leg: FlightLegData }>()

function formatDate(iso: string): string {
	try { return new Date(iso).toLocaleString() } catch { return iso }
}
</script>

<style scoped></style>


