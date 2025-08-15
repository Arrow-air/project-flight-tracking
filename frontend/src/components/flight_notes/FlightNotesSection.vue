<template>
	<section class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="flex items-end justify-between gap-3">
				<h2 class="card-title">Flight notes</h2>
				<div class="flex items-center gap-2">
					<select v-model="filters.type" class="select select-bordered select-sm">
						<option :value="undefined">All types</option>
						<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
					</select>
					<select v-model="filters.order" class="select select-bordered select-sm">
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
					<button class="btn btn-primary btn-sm" @click="openCreate">New note</button>
					<button class="btn btn-ghost btn-sm" @click="reload" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Refresh</span>
					</button>
				</div>
			</div>

			<div v-if="error" class="alert alert-error mt-3"><span>{{ error }}</span></div>
			<div v-if="!loading && notes.length === 0" class="text-sm text-base-content/70">No notes</div>

			<div class="grid gap-3 mt-4">
				<template v-for="n in notes" :key="n.id">
					<FlightNoteCard :note="n" @updated="handleUpdated" @deleted="handleDeleted" />
				</template>
			</div>

			<!-- Simple create inline drawer -->
			<dialog ref="createDialogRef" class="modal">
				<div class="modal-box">
					<h3 class="font-bold text-lg">Create note</h3>
					<form class="grid gap-3 mt-4" @submit.prevent="submitCreate">
						<label class="form-control w-full">
							<span class="label"><span class="label-text">Type</span></span>
							<select v-model="createForm.noteType" class="select select-bordered w-full" required>
								<option disabled value="">Select type</option>
								<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
							</select>
						</label>
						<label class="form-control w-full">
							<span class="label"><span class="label-text">Notes</span></span>
							<textarea v-model.trim="createForm.notes" class="textarea textarea-bordered w-full" rows="3" />
						</label>
						<div class="flex justify-end gap-2">
							<button type="button" class="btn" @click="closeCreate">Cancel</button>
							<button type="submit" class="btn btn-primary" :disabled="creating">
								<span v-if="creating" class="loading loading-spinner loading-sm"></span>
								<span v-else>Create</span>
							</button>
						</div>
						<p v-if="createError" class="text-error text-sm">{{ createError }}</p>
					</form>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { listFlightNotes, createFlightNote, type FlightNoteData, type FlightNoteType } from '@/api/rest/flight_notes.api'
import FlightNoteCard from '@/components/flight_notes/FlightNoteCard.vue'

const props = defineProps<{ flightLegId: string }>()

const types: FlightNoteType[] = ['pilot', 'admin', 'engineer', 'witness', 'other']
const notes = ref<FlightNoteData[]>([])
const loading = ref(false)
const error = ref('')
const filters = reactive<{ type?: FlightNoteType; order: 'asc' | 'desc' }>({ type: undefined, order: 'desc' })

const createDialogRef = ref<HTMLDialogElement | null>(null)
const creating = ref(false)
const createError = ref('')
const createForm = reactive<{ noteType: FlightNoteType | ''; notes: string }>({ noteType: '', notes: '' })

async function reload() {
	try {
		loading.value = true
		error.value = ''
		notes.value = await listFlightNotes(props.flightLegId, { type: filters.type, order: filters.order })
	} catch (e: any) {
		error.value = e?.message || 'Failed to load notes'
	} finally {
		loading.value = false
	}
}

function handleUpdated(updated: FlightNoteData) {
	const idx = notes.value.findIndex((n) => n.id === updated.id)
	if (idx !== -1) notes.value[idx] = updated
}

function handleDeleted(id: string) {
	notes.value = notes.value.filter((n) => n.id !== id)
}

function openCreate() { createDialogRef.value?.showModal() }
function closeCreate() { createDialogRef.value?.close() }

async function submitCreate() {
	try {
		creating.value = true
		createError.value = ''
		const created = await createFlightNote(props.flightLegId, {
			noteType: createForm.noteType as FlightNoteType,
			notes: createForm.notes || undefined,
		})
		// Insert according to sort
		if (filters.order === 'desc') notes.value = [created, ...notes.value]
		else notes.value = [...notes.value, created]
		createForm.noteType = ''
		createForm.notes = ''
		closeCreate()
	} catch (e: any) {
		createError.value = e?.message || 'Failed to create note'
	} finally {
		creating.value = false
	}
}

watch(() => [filters.type, filters.order, props.flightLegId], reload)
onMounted(reload)
</script>

<style scoped></style>


