<template>
	<section class="max-w-4xl mx-auto px-6 py-8" v-if="loaded">
		<!-- Header -->
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">{{ aircraft?.name || 'Aircraft' }}</h1>
				<p class="text-base-content/70">Serial: {{ aircraft?.serialNumber }}</p>
			</div>
			<div class="flex gap-2">
				<RouterLink class="btn" :to="{ name: 'AircraftList' }">Back</RouterLink>
				<button v-if="!editMode" class="btn btn-primary" @click="enableEdit">Edit</button>
				<button v-else class="btn" @click="cancelEdit">Cancel</button>
				<button v-if="editMode" class="btn btn-primary" :disabled="saving" @click="save">
					<span v-if="saving" class="loading loading-spinner loading-sm"></span>
					<span v-else>Save</span>
				</button>
				<button class="btn btn-error" @click="openDeleteModal">Delete</button>
			</div>
		</div>

		<!-- Alerts -->
		<div v-if="error" class="alert alert-error mb-4"><span>{{ error }}</span></div>
		<div v-if="success" class="alert alert-success mb-4"><span>{{ success }}</span></div>

		<!-- Content -->
		<div class="grid gap-6">
			<!-- Overview / Edit Card -->
			<div class="card bg-base-100 shadow">
				<div class="card-body grid gap-4">
					<h2 class="card-title">Details</h2>
					<template v-if="!editMode && aircraft">
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<div class="text-sm text-base-content/70">Name</div>
								<div>{{ aircraft.name || '—' }}</div>
							</div>
							<div>
								<div class="text-sm text-base-content/70">Type</div>
								<div>{{ aircraft.aircraftType || '—' }}</div>
							</div>
							<div>
								<div class="text-sm text-base-content/70">Serial number</div>
								<div>{{ aircraft.serialNumber }}</div>
							</div>
							<div>
								<div class="text-sm text-base-content/70">Owner</div>
								<div class="truncate">{{ aircraft.ownerId || '—' }}</div>
							</div>
						</div>
						<div>
							<div class="text-sm text-base-content/70">Notes</div>
							<p class="whitespace-pre-wrap">{{ aircraft.notes || '—' }}</p>
						</div>
						<div class="text-sm text-base-content/60">
							<span>Created: {{ formatDate(aircraft.createdAt) }}</span>
							<span class="mx-2">·</span>
							<span>Updated: {{ formatDate(aircraft.updatedAt) }}</span>
						</div>
					</template>

					<!-- Edit form -->
					<template v-else>
						<form class="grid gap-4" @submit.prevent="save">
							<label class="form-control w-full">
								<span class="label"><span class="label-text">Name</span></span>
								<input v-model.trim="form.name" class="input input-bordered w-full" />
							</label>
							<label class="form-control w-full">
								<span class="label"><span class="label-text">Type</span></span>
								<input v-model.trim="form.aircraftType" class="input input-bordered w-full" />
							</label>
							<label class="form-control w-full">
								<span class="label"><span class="label-text">Serial number</span></span>
								<input v-model.trim="form.serialNumber" class="input input-bordered w-full" required />
							</label>
							<label class="form-control w-full">
								<span class="label"><span class="label-text">Notes</span></span>
								<textarea v-model.trim="form.notes" class="textarea textarea-bordered w-full" rows="4" />
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

			<!-- Maintenance logs section -->
			<MaintenanceLogsSection v-if="aircraft" :aircraft-id="aircraft.id" />
		</div>

		<!-- Delete confirmation modal -->
		<dialog ref="deleteDialogRef" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg">Delete aircraft</h3>
				<p class="py-2">Are you sure you want to delete this aircraft? This action cannot be undone.</p>
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
import type { AircraftData, UpdateAircraftInput } from '@/api/rest/aircraft.api'
import { getAircraft, updateAircraft, deleteAircraft } from '@/api/rest/aircraft.api'
import MaintenanceLogsSection from '@/components/aircraft_maintenance/MaintenanceLogsSection.vue';

const route = useRoute()
const router = useRouter()

const aircraft = ref<AircraftData | null>(null)
const loaded = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

const form = ref<UpdateAircraftInput>({})
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString()
	} catch {
		return iso
	}
}

async function load() {
	try {
		error.value = ''
		success.value = ''
		const id = route.params.id as string
		const data = await getAircraft(id)
		aircraft.value = data
	} catch (e: any) {
		error.value = e?.message || 'Failed to load aircraft'
	} finally {
		loaded.value = true
	}
}

function enableEdit() {
	if (!aircraft.value) return
	editMode.value = true
	form.value = {
		name: aircraft.value.name || undefined,
		aircraftType: aircraft.value.aircraftType || undefined,
		serialNumber: aircraft.value.serialNumber,
		notes: aircraft.value.notes || undefined,
	}
}

function cancelEdit() {
	editMode.value = false
	form.value = {}
}

async function save() {
	if (!aircraft.value) return
	try {
		saving.value = true
		error.value = ''
		success.value = ''
		const updated = await updateAircraft(aircraft.value.id, form.value)
		aircraft.value = updated
		success.value = 'Aircraft updated'
		cancelEdit()
	} catch (e: any) {
		error.value = e?.message || 'Failed to update aircraft'
	} finally {
		saving.value = false
	}
}

function openDeleteModal() {
	deleteDialogRef.value?.showModal()
}

async function confirmDelete() {
	if (!aircraft.value) return
	try {
		deleting.value = true
		error.value = ''
		success.value = ''
		await deleteAircraft(aircraft.value.id)
		deleteDialogRef.value?.close()
		router.push({ name: 'AircraftList' })
	} catch (e: any) {
		error.value = e?.message || 'Failed to delete aircraft'
	} finally {
		deleting.value = false
	}
}

onMounted(load)
</script>

<style scoped></style>


