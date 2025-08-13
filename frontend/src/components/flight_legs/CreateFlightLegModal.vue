<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">Create flight leg</h3>
			<form class="mt-4 grid gap-3" @submit.prevent="submit">

				<!-- Aircraft selection -->
				<div class="form-control w-full">
					<span class="label"><span class="label-text">Aircraft</span></span>
					<select v-model="form.aircraftId" class="select select-bordered w-full" :disabled="aircraftLoading" required>
						<option disabled value="">Select aircraft by serial number</option>
						<option v-for="ac in aircrafts" :key="ac.id" :value="ac.id">
							{{ ac.serialNumber }}
							<span v-if="ac.name"> · {{ ac.name }}</span>
						</option>
					</select>
					<p v-if="aircraftError" class="text-error text-sm mt-1">{{ aircraftError }}</p>
					<div v-if="!aircraftLoading && aircrafts.length === 0" class="alert alert-warning mt-2">
						<div>
							<span>You have no aircraft yet. Please create one first.</span>
						</div>
						<div class="mt-2">
							<RouterLink class="btn btn-sm btn-primary" to="/aircraft">Go to Aircraft</RouterLink>
						</div>
					</div>
				</div>

				<!-- Title -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Title</span></span>
					<input v-model.trim="form.title" class="input input-bordered w-full" placeholder="Optional" />
				</label>
				
				<!-- <div class="grid grid-cols-2 gap-3">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Location</span></span>
						<input v-model.trim="form.location" class="input input-bordered w-full" />
					</label>
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Altitude (m)</span></span>
						<input v-model.number="form.altitudeM" type="number" class="input input-bordered w-full" />
					</label>
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Temperature (°C)</span></span>
						<input v-model.number="form.tempC" type="number" class="input input-bordered w-full" />
					</label>
				</div> -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Description</span></span>
					<textarea v-model.trim="form.description" class="textarea textarea-bordered w-full" rows="3" />
				</label>
				<div class="mt-2 flex justify-end gap-2">
					<button type="button" class="btn" @click="close">Cancel</button>
					<button type="submit" class="btn btn-primary" :disabled="loading || aircrafts.length === 0 || !form.aircraftId">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Create</span>
					</button>
				</div>
				<p v-if="error" class="text-error text-sm mt-1">{{ error }}</p>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FlightLegData } from '@/api/rest/flight_legs.api'
import { createFlightLeg } from '@/api/rest/flight_legs.api'
import { listAircraft, type AircraftData } from '@/api/rest/aircraft.api'

const emit = defineEmits<{ (e: 'created', value: FlightLegData): void }>()

const modalRef = ref<HTMLDialogElement | null>(null)
const loading = ref(false)
const error = ref('')
const form = ref<{ aircraftId: string; title?: string; location?: string; altitudeM?: number | null; tempC?: number | null; description?: string }>(
	{ aircraftId: '', title: '', location: '', altitudeM: undefined, tempC: undefined, description: '' }
)

// Aircraft selection state
const aircrafts = ref<AircraftData[]>([])
const aircraftLoading = ref(false)
const aircraftError = ref('')

async function loadAircrafts() {
	try {
		aircraftLoading.value = true
		aircraftError.value = ''
		aircrafts.value = await listAircraft()
	} catch (e: any) {
		aircraftError.value = e?.message || 'Failed to load aircraft'
	} finally {
		aircraftLoading.value = false
	}
}

function open() { modalRef.value?.showModal() }
function close() { modalRef.value?.close() }
defineExpose({ open, close })

onMounted(() => { if (aircrafts.value.length === 0) loadAircrafts() });

async function submit() {
	try {
		loading.value = true
		error.value = ''
		const created = await createFlightLeg({
			aircraftId: form.value.aircraftId,
			title: form.value.title || undefined,
			location: form.value.location || undefined,
			altitudeM: form.value.altitudeM ?? null,
			tempC: form.value.tempC ?? null,
			description: form.value.description || undefined,
		})
		emit('created', created)
		close()
		form.value = { aircraftId: '', title: '', location: '', altitudeM: undefined, tempC: undefined, description: '' }
	} catch (e: any) {
		error.value = e?.message || 'Failed to create flight leg'
	} finally {
		loading.value = false
	}
}
</script>

<style scoped></style>

