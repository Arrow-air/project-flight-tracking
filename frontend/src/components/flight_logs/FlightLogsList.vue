<template>
	<section class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="flex items-end justify-between mb-2">
				<h3 class="card-title">Flight logs</h3>
				<div class="flex items-center gap-2">
					<select v-model="order" class="select select-bordered select-sm">
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
					<button class="btn btn-ghost btn-sm" @click="reload" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Refresh</span>
					</button>
				</div>
			</div>

			<div v-if="error" class="alert alert-error mb-2"><span>{{ error }}</span></div>
			<div v-if="!loading && logs.length === 0" class="text-sm text-base-content/70">No flight logs</div>

			<div class="grid gap-3">
				<template v-for="log in logs" :key="log.id">
					<FlightLogRecord :log="log" @deleted="handleDeleted" />
				</template>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { listFlightLogs, type FlightLogData } from '@/api/rest/flight_leg_logs.api'
import FlightLogRecord from '@/components/flight_logs/FlightLogRecord.vue'

const props = defineProps<{ flightLegId: string }>()

const logs = ref<FlightLogData[]>([])
const loading = ref(false)
const error = ref('')
const order = ref<'asc' | 'desc'>('desc')

async function reload() {
	try {
		loading.value = true
		error.value = ''
		logs.value = await listFlightLogs(props.flightLegId, { order: order.value })
	} catch (e: any) {
		error.value = e?.message || 'Failed to load logs'
	} finally {
		loading.value = false
	}
}

function handleDeleted(id: string) {
	logs.value = logs.value.filter((l) => l.id !== id)
}

watch(() => [props.flightLegId, order.value], reload)
onMounted(reload)
</script>

<style scoped></style>


