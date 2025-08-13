<template>
	<section class="card bg-base-100 shadow">
		<div class="card-body grid gap-4">
			<div class="flex items-start justify-between">
				<h2 class="card-title">Flight leg details</h2>
				<div class="flex gap-2">
					<button v-if="!editMode" class="btn btn-primary btn-sm" @click="enableEdit">Edit</button>
					<button v-else class="btn btn-sm" @click="cancelEdit">Cancel</button>
					<button v-if="editMode" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
						<span v-if="saving" class="loading loading-spinner loading-sm"></span>
						<span v-else>Save</span>
					</button>
					<button class="btn btn-error btn-sm" @click="openDeleteModal">Delete</button>
				</div>
			</div>

			<div v-if="error" class="alert alert-error"><span>{{ error }}</span></div>
			<div v-if="success" class="alert alert-success"><span>{{ success }}</span></div>

			<!-- Flight leg details (read-only) -->
			<template v-if="!editMode && leg">
				<div class="grid sm:grid-cols-2 gap-4">
					<div>
						<div class="text-sm text-base-content/70">Aircraft</div>
						<div>
							<RouterLink
								v-if="aircraft"
								class="btn btn-outline btn-sm"
								:to="{ name: 'Aircraft', params: { id: aircraft.id } }"
							>
								{{ aircraft.serialNumber }}
							</RouterLink>
							<span v-else>{{ leg.aircraftId }}</span>
						</div>
					</div>
					<div>
						<div class="text-sm text-base-content/70">Location</div>
						<div>{{ leg.location || '—' }}</div>
					</div>
					<div>
						<div class="text-sm text-base-content/70">Altitude (m)</div>
						<div>{{ leg.altitudeM ?? '—' }}</div>
					</div>
					<div>
						<div class="text-sm text-base-content/70">Temperature (°C)</div>
						<div>{{ leg.tempC ?? '—' }}</div>
					</div>
				</div>
				<div>
					<div class="text-sm text-base-content/70">Description</div>
					<p class="whitespace-pre-wrap">{{ leg.description || '—' }}</p>
				</div>
				<div class="text-sm text-base-content/60 flex flex-wrap gap-2">
					<span v-if="leg.pilotName">Pilot: {{ leg.pilotName }}</span>
					<span>Created: {{ formatDate(leg.createdAt) }}</span>
					<span class="mx-2">·</span>
					<span>Updated: {{ formatDate(leg.updatedAt) }}</span>
				</div>
			</template>

			<!-- Edit form -->
			<template v-else>
				<form class="grid gap-4" @submit.prevent="save">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Title</span></span>
						<input v-model.trim="form.title" class="input input-bordered w-full" />
					</label>
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Location</span></span>
						<input v-model.trim="form.location" class="input input-bordered w-full" />
					</label>
					<div class="grid grid-cols-2 gap-3">
						<label class="form-control w-full">
							<span class="label"><span class="label-text">Altitude (m)</span></span>
							<input v-model.number="form.altitudeM" type="number" class="input input-bordered w-full" />
						</label>
						<label class="form-control w-full">
							<span class="label"><span class="label-text">Temperature (°C)</span></span>
							<input v-model.number="form.tempC" type="number" class="input input-bordered w-full" />
						</label>
					</div>
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Description</span></span>
						<textarea v-model.trim="form.description" class="textarea textarea-bordered w-full" rows="4" />
					</label>
					<div class="flex justify-end gap-2">
						<button type="button" class="btn" @click="cancelEdit">Cancel</button>
						<button type="submit" class="btn btn-primary" :disabled="saving">
							<span v-if="saving" class="loading loading-spinner loading-sm"></span>
							<span v-else>Save</span>
						</button>
					</div>
				</form>
			</template>

			<!-- Delete confirmation modal -->
			<dialog ref="deleteDialogRef" class="modal">
				<div class="modal-box">
					<h3 class="font-bold text-lg">Delete flight leg</h3>
					<p class="py-2">Are you sure you want to delete this record?</p>
					<div class="modal-action">
						<form method="dialog" class="flex gap-2">
							<button class="btn">Cancel</button>
							<button class="btn btn-error" @click.prevent="confirmDelete" :disabled="deleting">
								<span v-if="deleting" class="loading loading-spinner loading-sm"></span>
								<span v-else>Delete</span>
							</button>
						</form>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { FlightLegData, UpdateFlightLegInput } from '@/api/rest/flight_legs.api'
import { getFlightLeg, updateFlightLeg, deleteFlightLeg } from '@/api/rest/flight_legs.api'
import { getAircraft, type AircraftData } from '@/api/rest/aircraft.api'

const props = defineProps<{ flightId: string }>()
const emit = defineEmits<{ (e: 'loaded', value: FlightLegData): void; (e: 'updated', value: FlightLegData): void; (e: 'deleted', id: string): void }>()

const leg = ref<FlightLegData | null>(null);
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

const form = reactive<UpdateFlightLegInput>({})
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

// Related aircraft display
const aircraft = ref<AircraftData | null>(null)
const aircraftError = ref('')

function formatDate(iso: string): string {
	try { return new Date(iso).toLocaleString() } catch { return iso }
}

async function load() {
	try {
		error.value = ''
		const data = await getFlightLeg(props.flightId)
		leg.value = data
		emit('loaded', data)
		await loadAircraft()
	} catch (e: any) {
		error.value = e?.message || 'Failed to load flight leg'
	}
}

async function loadAircraft() {
	aircraft.value = null
	aircraftError.value = ''
	try {
		if (!leg.value?.aircraftId) return
		aircraft.value = await getAircraft(leg.value.aircraftId)
	} catch (e: any) {
		aircraftError.value = e?.message || 'Failed to load aircraft'
	}
}

function enableEdit() {
	if (!leg.value) return
	editMode.value = true
	form.title = leg.value.title || undefined
	form.location = leg.value.location || undefined
	form.altitudeM = leg.value.altitudeM ?? undefined
	form.tempC = leg.value.tempC ?? undefined
	form.description = leg.value.description || undefined
}

function cancelEdit() {
	editMode.value = false
	form.title = undefined
	form.location = undefined
	form.altitudeM = undefined
	form.tempC = undefined
	form.description = undefined
}

async function save() {
	if (!leg.value) return
	try {
		saving.value = true
		error.value = ''
		success.value = ''
		const updated = await updateFlightLeg(leg.value.id, { ...form })
		leg.value = updated
		emit('updated', updated)
		success.value = 'Flight leg updated'
		cancelEdit()
	} catch (e: any) {
		error.value = e?.message || 'Failed to update flight leg'
	} finally {
		saving.value = false
	}
}

function openDeleteModal() { deleteDialogRef.value?.showModal() }

async function confirmDelete() {
	if (!leg.value) return
	try {
		deleting.value = true
		error.value = ''
		success.value = ''
		await deleteFlightLeg(leg.value.id)
		emit('deleted', leg.value.id)
		deleteDialogRef.value?.close()
	} catch (e: any) {
		error.value = e?.message || 'Failed to delete flight leg'
	} finally {
		deleting.value = false
	}
}

onMounted(load)
</script>

<style scoped></style>

