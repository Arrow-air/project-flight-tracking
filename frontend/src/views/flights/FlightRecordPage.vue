<template>
	<section class="max-w-4xl mx-auto px-6 py-8" v-if="loaded">
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">{{ leg?.title || 'Flight leg' }}</h1>
				<p class="text-base-content/70">ID: {{ leg?.id }}</p>
			</div>
		</div>

		<div v-if="error" class="alert alert-error mb-4"><span>{{ error }}</span></div>

    	<FlightLegDetailsSection :flight-id="route.params.flight_id as string"
    		@loaded="(l) => (leg = l)"
    		@updated="handleUpdated"
    		@deleted="handleDeleted"
    	/>

        
        <!-- Flight logs: upload and list -->
        <div v-if="leg" class="mt-6 grid gap-4">
            <FlightLogUpload :flight-leg-id="leg.id" />
            <FlightLogsList :flight-leg-id="leg.id" />
        </div>


        <!-- Flight notes: list and create -->
        <FlightNotesSection v-if="leg" class="mt-6" :flight-leg-id="leg.id" />

        

		<!-- Delete confirmation modal -->
		<!-- Deletion handled inside details section -->
	</section>

	<section v-else class="max-w-4xl mx-auto px-6 py-20 grid place-items-center">
		<span class="loading loading-spinner loading-lg"></span>
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FlightLegData } from '@/api/rest/flight_legs.api'
import { getFlightLeg } from '@/api/rest/flight_legs.api'
import FlightLegDetailsSection from '@/components/flight_legs/FlightLegDetailsSection.vue'
import FlightNotesSection from '@/components/flight_notes/FlightNotesSection.vue'
import FlightLogUpload from '@/components/flight_logs/FlightLogUpload.vue'
import FlightLogsList from '@/components/flight_logs/FlightLogsList.vue'

const route = useRoute()
const router = useRouter()

const leg = ref<FlightLegData | null>(null)
const loaded = ref(false)
const error = ref('')
const success = ref('')

async function load() {
	try {
		error.value = ''
		success.value = ''
		const id = route.params.flight_id as string
		const data = await getFlightLeg(id)
		leg.value = data
	} catch (e: any) {
		error.value = e?.message || 'Failed to load flight leg'
	} finally {
		loaded.value = true
	}
}

function handleUpdated(updated: FlightLegData) { leg.value = updated }
function handleDeleted() { router.push({ name: 'Flights' }) };

onMounted(load)
</script>

<style scoped></style>


