<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">Create maintenance log</h3>
			<form class="mt-4 grid gap-3" @submit.prevent="submit">
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Type</span></span>
					<select v-model="form.logType" class="select select-bordered w-full" required>
						<option disabled value="">Select type</option>
						<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
					</select>
				</label>
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Notes</span></span>
					<textarea v-model.trim="form.notes" class="textarea textarea-bordered w-full" rows="3" />
				</label>
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

const modalRef = ref<HTMLDialogElement | null>(null)
const loading = ref(false)
const error = ref('')
const form = ref<{ logType: MaintenanceLogType | ''; notes: string }>({ logType: '', notes: '' })

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
		if (!form.value.logType) throw new Error('Please choose a log type')
		const created = await createMaintenanceLog(props.aircraftId, {
			logType: form.value.logType as MaintenanceLogType,
			notes: form.value.notes || undefined,
		})
		emit('created', created)
		close()
		form.value = { logType: '', notes: '' }
	} catch (e: any) {
		error.value = e?.message || 'Failed to create maintenance log'
	} finally {
		loading.value = false
	}
}
</script>

<style scoped></style>

