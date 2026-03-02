<template>
	<div class="card bg-base-200">
		<div class="card-body gap-3">
			<!-- Header row -->
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
					<button class="btn btn-error btn-sm" @click="confirmDelete" :disabled="deleting">
						<span v-if="deleting" class="loading loading-spinner loading-xs"></span>
						<span v-else>Delete</span>
					</button>
				</div>
			</div>

			<!-- Flight Summary -->
			<div v-if="summary" class="border border-base-300 rounded-lg p-3 text-sm space-y-2">
				<!-- Score + header -->
				<div class="flex items-center justify-between">
					<span class="font-semibold text-base-content/80">Flight Summary</span>
					<span class="badge text-white font-bold"
						:class="{
							'badge-success': summary.health_score >= 80,
							'badge-warning': summary.health_score >= 50 && summary.health_score < 80,
							'badge-error':   summary.health_score < 50
						}">
						{{ summary.health_score }}/100
					</span>
				</div>

				<!-- Key stats -->
				<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-base-content/70">
					<span>Duration: <strong class="text-base-content">{{ summary.summary?.duration ?? '—' }}</strong></span>
					<span>Max current: <strong class="text-base-content">{{ summary.summary?.max_current_a ?? '—' }} A</strong></span>
					<span>Min voltage: <strong class="text-base-content">{{ summary.summary?.min_voltage_v ?? '—' }} V</strong></span>
					<span>Modes: <strong class="text-base-content">{{ (summary.summary?.modes_used ?? []).join(', ') || '—' }}</strong></span>
				</div>

				<!-- Check badges -->
				<div class="flex flex-wrap gap-1">
					<template v-for="(check, key) in summary.checks" :key="key">
						<span class="badge badge-sm"
							:class="{
								'badge-success': check.status === 'good',
								'badge-warning': check.status === 'warn',
								'badge-error':   check.status === 'fail',
							}">
							{{ formatCheckKey(key) }}
						</span>
					</template>
				</div>

				<!-- Anomalies -->
				<div v-if="summary.anomalies?.length" class="text-xs text-error space-y-0.5">
					<div class="font-semibold text-base-content/70">Anomalies</div>
					<div v-for="(a, i) in summary.anomalies" :key="i">
						<span class="text-base-content/50">[{{ a.time }}]</span> {{ a.message }}
					</div>
				</div>

				<div class="text-xs text-base-content/40">Generated {{ formatDate(summary.generated_at) }}</div>
			</div>

			<!-- No summary yet -->
			<div v-else class="text-xs text-base-content/40 italic">
				No summary yet — run <code>flight_summary.py</code> against this log and upload the result.
			</div>

			<div v-if="error" class="text-error text-xs">{{ error }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getSignedUrl, deleteFlightLog, type FlightLogData } from '@/api/rest/flight_leg_logs.api';

const props = defineProps<{ log: FlightLogData }>();
const emit = defineEmits<{ (e: 'deleted', id: string): void }>();

const signedUrl = ref('');
const deleting = ref(false);
const error = ref('');

// Parse summary from log.summary (JSONB comes through as object or null)
const summary = computed(() => {
	if (!props.log.summary) return null;
	if (typeof props.log.summary === 'string') {
		try { return JSON.parse(props.log.summary); } catch { return null; }
	}
	return props.log.summary as Record<string, any>;
});

const prettySize = computed(() => {
	const bytes = props.log.sizeBytes || 0;
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${bytes} B`;
});

function formatDate(iso: string): string {
	try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function formatCheckKey(key: string): string {
	return key.replace(/_/g, ' ');
}

async function openSigned() {
	signedUrl.value = await getSignedUrl(props.log.objectPath, 300, props.log.bucket);
	window.open(signedUrl.value, '_blank');
}

async function confirmDelete() {
	if (!window.confirm('Delete this flight log? This cannot be undone.')) return;
	try {
		deleting.value = true;
		error.value = '';
		await deleteFlightLog(props.log.id);
		emit('deleted', props.log.id);
	} catch (e: any) {
		error.value = e?.message || 'Failed to delete flight log';
	} finally {
		deleting.value = false;
	}
}
</script>

<style scoped></style>
