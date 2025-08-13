<template>
	<section class="max-w-4xl mx-auto px-6 py-8" v-if="loaded">
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">{{ leg?.title || 'Flight leg' }}</h1>
				<p class="text-base-content/70">ID: {{ leg?.id }}</p>
			</div>
			<div class="flex gap-2">
				<RouterLink class="btn" :to="{ name: 'Flights' }">Back</RouterLink>
				<button v-if="!editMode" class="btn btn-primary" @click="enableEdit">Edit</button>
				<button v-else class="btn" @click="cancelEdit">Cancel</button>
				<button v-if="editMode" class="btn btn-primary" :disabled="saving" @click="save">
					<span v-if="saving" class="loading loading-spinner loading-sm"></span>
					<span v-else>Save</span>
				</button>
				<button class="btn btn-error" @click="openDeleteModal">Delete</button>
			</div>
		</div>

		<div v-if="error" class="alert alert-error mb-4"><span>{{ error }}</span></div>
		<div v-if="success" class="alert alert-success mb-4"><span>{{ success }}</span></div>

		<div class="card bg-base-100 shadow">
			<div class="card-body grid gap-4">
				<h2 class="card-title">Details</h2>
				<template v-if="!editMode && leg">
					<div class="grid sm:grid-cols-2 gap-4">
						<div>
							<div class="text-sm text-base-content/70">Aircraft ID</div>
							<div>{{ leg.aircraftId }}</div>
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
					<div class="text-sm text-base-content/60">
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
			</div>
		</div>

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
	</section>

	<section v-else class="max-w-4xl mx-auto px-6 py-20 grid place-items-center">
		<span class="loading loading-spinner loading-lg"></span>
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FlightLegData, UpdateFlightLegInput } from '@/api/rest/flight_legs.api'
import { getFlightLeg, updateFlightLeg, deleteFlightLeg } from '@/api/rest/flight_legs.api'

const route = useRoute()
const router = useRouter()

const leg = ref<FlightLegData | null>(null)
const loaded = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

const form = ref<UpdateFlightLegInput>({})
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

function formatDate(iso: string): string {
	try { return new Date(iso).toLocaleString() } catch { return iso }
}

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

function enableEdit() {
	if (!leg.value) return
	editMode.value = true
	form.value = {
		title: leg.value.title || undefined,
		location: leg.value.location || undefined,
		altitudeM: leg.value.altitudeM ?? undefined,
		tempC: leg.value.tempC ?? undefined,
		description: leg.value.description || undefined,
	}
}

function cancelEdit() {
	editMode.value = false
	form.value = {}
}

async function save() {
	if (!leg.value) return
	try {
		saving.value = true
		error.value = ''
		success.value = ''
		const updated = await updateFlightLeg(leg.value.id, form.value)
		leg.value = updated
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
		deleteDialogRef.value?.close()
		router.push({ name: 'Flights' })
	} catch (e: any) {
		error.value = e?.message || 'Failed to delete flight leg'
	} finally {
		deleting.value = false
	}
}

onMounted(load)
</script>

<style scoped></style>


