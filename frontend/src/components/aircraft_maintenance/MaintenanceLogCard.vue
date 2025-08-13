<template>
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="flex items-start justify-between gap-3">
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<h3 class="card-title text-base">Maintenance log</h3>
						<span class="badge badge-outline">{{ log.logType }}</span>
					</div>
					<div class="text-xs text-base-content/70">
						<span>Created: {{ formatDate(log.createdAt) }}</span>
						<span class="mx-1">·</span>
						<span>Updated: {{ formatDate(log.updatedAt) }}</span>
					</div>
				</div>
				<div class="card-actions">
					<button v-if="!editMode" class="btn btn-ghost btn-sm" @click="enableEdit">Edit</button>
					<button v-else class="btn btn-ghost btn-sm" @click="cancelEdit">Cancel</button>
					<button class="btn btn-error btn-sm" @click="openDeleteModal">Delete</button>
				</div>
			</div>

			<!-- View mode -->
			<p v-if="!editMode && log.notes" class="mt-2 whitespace-pre-wrap">{{ log.notes }}</p>
			<p v-else-if="!editMode && !log.notes" class="mt-2 text-sm text-base-content/70">No notes</p>

			<!-- Edit mode -->
			<form v-else class="grid gap-3" @submit.prevent="save">
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Type</span></span>
					<select v-model="form.logType" class="select select-bordered w-full">
						<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
					</select>
				</label>
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Notes</span></span>
					<textarea v-model.trim="form.notes" class="textarea textarea-bordered w-full" rows="3" />
				</label>
				<div class="flex justify-end gap-2">
					<button type="button" class="btn" @click="cancelEdit">Cancel</button>
					<button type="submit" class="btn btn-primary" :disabled="saving">
						<span v-if="saving" class="loading loading-spinner loading-sm"></span>
						<span v-else>Save</span>
					</button>
				</div>
				<p v-if="error" class="text-error text-sm">{{ error }}</p>
			</form>
		</div>

		<!-- Delete confirmation modal -->
		<dialog ref="deleteDialogRef" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg">Delete maintenance log</h3>
				<p class="py-2">Are you sure you want to delete this log?</p>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MaintenanceLogData, MaintenanceLogType, UpdateMaintenanceLogInput } from '@/api/rest/aircraft_maintenance.api'
import { updateMaintenanceLog, deleteMaintenanceLog } from '@/api/rest/aircraft_maintenance.api'

const props = defineProps<{ log: MaintenanceLogData }>();
const emit = defineEmits<{ (e: 'updated', value: MaintenanceLogData): void; (e: 'deleted', id: string): void }>()

const types: MaintenanceLogType[] = ['build', 'maintenance', 'upgrade', 'repair', 'trouble-shooting', 'ground-run', 'other'];

const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

const form = ref<UpdateMaintenanceLogInput>({})

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function enableEdit() {
	editMode.value = true
	form.value = { logType: props.log.logType, notes: props.log.notes ?? undefined }
}

function cancelEdit() {
	editMode.value = false
	form.value = {}
	error.value = ''
}

async function save() {
	try {
		saving.value = true
		error.value = ''
		const updated = await updateMaintenanceLog(props.log.id, form.value)
		editMode.value = false
		emit('updated', updated)
	} catch (e: any) {
		error.value = e?.message || 'Failed to update maintenance log'
	} finally {
		saving.value = false
	}
}

function openDeleteModal() { deleteDialogRef.value?.showModal(); }

async function confirmDelete() {
	try {
		deleting.value = true
		error.value = ''
		await deleteMaintenanceLog(props.log.id)
		deleteDialogRef.value?.close()
		emit('deleted', props.log.id)
	} catch (e: any) {
		error.value = e?.message || 'Failed to delete maintenance log'
	} finally {
		deleting.value = false
	}
}
</script>

<style scoped></style>


