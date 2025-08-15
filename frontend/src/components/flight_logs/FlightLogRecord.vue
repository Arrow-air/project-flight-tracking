<template>
	<div class="card bg-base-200">
		<div class="card-body">
			<div class="flex items-start justify-between gap-3">
				<div class="space-y-1 text-sm">
					<div class="flex flex-wrap gap-2 items-center">
						<span class="badge">{{ prettySize }}</span>
						<span class="badge badge-outline">{{ log.contentType || 'unknown' }}</span>
						<span v-if="log.uploadedByName" class="text-base-content/70">Uploaded by {{ log.uploadedByName }}</span>
					</div>
					<div class="text-xs text-base-content/70">
						<span>Uploaded: {{ formatDate(log.createdAt) }}</span>
					</div>
				</div>
				<div class="card-actions">
					<a class="btn btn-ghost btn-sm" :href="signedUrl" target="_blank" rel="noopener" @click.prevent="openSigned">Open</a>
					<button class="btn btn-error btn-sm" @click="confirmDelete">Delete</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getSignedUrl, deleteFlightLog, type FlightLogData } from '@/api/rest/flight_leg_logs.api'

const props = defineProps<{ log: FlightLogData }>()
const emit = defineEmits<{ (e: 'deleted', id: string): void }>()

const signedUrl = ref('')

const prettySize = computed(() => {
	const bytes = props.log.sizeBytes || 0
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${bytes} B`
})

function formatDate(iso: string): string { try { return new Date(iso).toLocaleString() } catch { return iso } }

async function openSigned() {
	signedUrl.value = await getSignedUrl(props.log.objectPath, 300, props.log.bucket)
	window.open(signedUrl.value, '_blank')
}

async function confirmDelete() {
	await deleteFlightLog(props.log.id)
	emit('deleted', props.log.id)
}
</script>

<style scoped></style>


