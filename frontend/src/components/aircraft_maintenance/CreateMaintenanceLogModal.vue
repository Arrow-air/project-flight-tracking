<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">Create maintenance log</h3>
			<form class="mt-4 grid gap-3" @submit.prevent="submit">

				<!-- Log Type -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Type</span></span>
					<select v-model="logType" class="select select-bordered w-full" required>
						<option disabled value="">Select type</option>
						<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
					</select>
				</label>

				<!-- Log Date -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Log Date</span></span>
					<input v-model="logDate" type="date" class="input input-bordered w-full" />
				</label>

				<!-- Log Title -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Title</span></span>
					<input v-model.trim="title" type="text" class="input input-bordered w-full" placeholder="Optional title for this log entry" />
				</label>

				<!-- Maintenance Log Notes -->
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Notes</span></span>
					<textarea v-model.trim="notes" class="textarea textarea-bordered w-full" rows="3" />
				</label>

				<!-- Submit -->
				<div class="mt-2 flex justify-end gap-2">
					<button type="button" class="btn" @click="close">Cancel</button>
					<button type="submit" class="btn btn-primary" :disabled="loading">
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
import { ref } from 'vue'
import type { MaintenanceLogData, MaintenanceLogType } from '@/api/rest/aircraft_maintenance.api'
import { createMaintenanceLog } from '@/api/rest/aircraft_maintenance.api'

const props = defineProps<{ aircraftId: string }>()
const emit = defineEmits<{ (e: 'created', value: MaintenanceLogData): void }>()

const types: MaintenanceLogType[] = ['build', 'maintenance', 'upgrade', 'repair', 'trouble-shooting', 'ground-run', 'other']

const modalRef = ref<HTMLDialogElement | null>(null);
const loading = ref(false);
const error = ref('');
const form = ref<{ logType: MaintenanceLogType | ''; title: string; logDate: string; notes: string }>({ logType: '', title: '', logDate: '', notes: '' })

const logType = ref<MaintenanceLogType>('build');
const title = ref<string | undefined>(undefined);
const logDate = ref<string>(new Date().toISOString().split('T')[0]);
const notes = ref<string>('');

function resetForm() {
	logType.value = 'build';
	title.value = undefined;
	logDate.value = new Date().toISOString().split('T')[0];
	notes.value = '';
}

function open() {
	modalRef.value?.showModal()
}

function close() {
	modalRef.value?.close()
}

defineExpose({ open, close })

async function submit() {
	try {
		loading.value = true
		error.value = ''
		if (!logType.value) throw new Error('Please choose a log type')
		if (!notes.value) throw new Error('Please enter some notes')
		const created = await createMaintenanceLog(props.aircraftId, {
			logType: logType.value,
			title: title.value,
			logDate: logDate.value,
			notes: notes.value,
		})
		emit('created', created);
		close();
	} catch (e: any) {
		error.value = e?.message || 'Failed to create maintenance log';
	} finally {
		loading.value = false;
		resetForm();
	}
}
</script>

<style scoped></style>

