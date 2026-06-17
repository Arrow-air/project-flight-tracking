<template>
	<section class="max-w-6xl mx-auto px-6 py-8">

		<!-- Fleet Stats Banner -->
		<div v-if="fleetTotals" class="stats shadow mb-6 w-full">
			<div class="stat">
				<div class="stat-title">Total Fleet Flight Time</div>
				<div class="stat-value text-primary">{{ formatFlightTime(fleetTotals.totalFlightMinutes) }}</div>
				<div class="stat-desc">across {{ fleetTotals.aircraftWithLogs }} of {{ fleetTotals.totalAircraft }} aircraft</div>
			</div>
			<div class="stat">
				<div class="stat-title">Total Flight Legs</div>
				<div class="stat-value">{{ fleetTotals.totalFlightLegs }}</div>
			</div>
		</div>

        <!-- Aircraft List Header -->
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">Your Aircraft</h1>
				<p class="text-base-content/70">Your fleet to manage</p>
			</div>
			<button class="btn btn-primary" @click="openCreateModal">
				<span class="mr-1">+</span>
				<span>New aircraft</span>
			</button>
		</div>

		<div v-if="error" class="alert alert-error mb-4">
			<span>{{ error }}</span>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<CreateAircraftCard @create="openCreateModal" />

            <!-- Aircraft List -->
			<template v-for="ac in aircraft" :key="ac.id">
				<AircraftCard :aircraft="ac" :total-flight-minutes="flightTotalsMap[ac.id] ?? null">
					<template #actions>
						<RouterLink class="btn btn-ghost btn-sm" :to="{ name: 'Aircraft', params: { id: ac.id } }">Open</RouterLink>
					</template>
				</AircraftCard>
			</template>
		</div>

		<CreateAircraftModal ref="createModalRef" @created="handleCreated" />
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { listAircraft, type AircraftData } from '@/api/rest/aircraft.api'
import { getAircraftFlightTotals } from '@/api/rest/aircraft_flight_totals.api'
import { getFleetFlightTotals, type FleetFlightTotal } from '@/api/rest/fleet_flight_totals.api'
import CreateAircraftCard from '@/components/aircraft/CreateAircraftCard.vue'
import AircraftCard from '@/components/aircraft/AircraftCard.vue'
import CreateAircraftModal from '@/components/aircraft/CreateAircraftModal.vue'

const aircraft = ref<AircraftData[]>([])
const error = ref('')
const createModalRef = ref<InstanceType<typeof CreateAircraftModal> | null>(null)
const flightTotalsMap = reactive<Record<string, number | null>>({})
const fleetTotals = ref<FleetFlightTotal | null>(null)

function formatFlightTime(minutes: number | null): string {
	if (minutes == null) return '\u2014'
	const h = Math.floor(minutes / 60)
	const m = Math.round(minutes % 60)
	return `${h}h ${m}m`
}

async function fetchAircraft() {
	try {
		const rows = await listAircraft()
		aircraft.value = rows
	} catch (e: any) {
		error.value = e?.message || 'Failed to load aircraft'
	}
}

async function fetchFlightTotals() {
	try {
		const totals = await getAircraftFlightTotals()
		for (const t of totals) {
			flightTotalsMap[t.aircraftId] = t.totalFlightMinutes
		}
	} catch { /* non-critical */ }
}

async function fetchFleetTotals() {
	try {
		fleetTotals.value = await getFleetFlightTotals()
	} catch { /* non-critical */ }
}

function openCreateModal() {
	createModalRef.value?.open()
}

async function handleCreated(newAircraft: AircraftData) {
	// Optimistically add to the top
	aircraft.value = [newAircraft, ...aircraft.value]
}

onMounted(() => {
	fetchAircraft()
	fetchFlightTotals()
	fetchFleetTotals()
})
</script>

<style scoped></style>


