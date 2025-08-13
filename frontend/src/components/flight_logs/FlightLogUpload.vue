<template>
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h3 class="card-title">Upload flight log</h3>
			<form class="grid gap-3" @submit.prevent="submit">
				<input type="file" class="file-input file-input-bordered w-full" @change="onFile" />
				<div class="flex justify-end gap-2">
					<button type="submit" class="btn btn-primary" :disabled="!file || uploading">
						<span v-if="uploading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Upload</span>
					</button>
				</div>
				<p v-if="error" class="text-error text-sm">{{ error }}</p>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadFlightLog, type FlightLogData } from '@/api/rest/flight_leg_logs.api'

const props = defineProps<{ flightLegId: string }>()
const emit = defineEmits<{ (e: 'uploaded', value: FlightLogData): void }>()

const file = ref<File | null>(null)
const uploading = ref(false)
const error = ref('')

function onFile(e: Event) {
	const input = e.target as HTMLInputElement
	file.value = input.files?.[0] || null
}

async function submit() {
	if (!file.value) return
	try {
		uploading.value = true
		error.value = ''
		const created = await uploadFlightLog(props.flightLegId, file.value)
		emit('uploaded', created)
		file.value = null
	} catch (e: any) {
		error.value = e?.message || 'Failed to upload flight log'
	} finally {
		uploading.value = false
	}
}
</script>

<style scoped></style>


