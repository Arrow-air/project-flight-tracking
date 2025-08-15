<template>
	<section class="card bg-base-100 shadow">
		<div class="card-body">

            <!-- Maintenance Logs Header -->
			<div class="flex items-end justify-between gap-3">
				<h2 class="card-title">Maintenance logs</h2>
				<div class="flex items-center gap-2">
					<select v-model="filters.type" class="select select-bordered select-sm">
						<option :value="undefined">All types</option>
						<option v-for="t in types" :key="t" :value="t">{{ t }}</option>
					</select>
					<select v-model="filters.order" class="select select-bordered select-sm">
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
					<button class="btn btn-primary btn-sm" @click="openCreateModal">New log</button>
					<button class="btn btn-ghost btn-sm" @click="reload" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Refresh</span>
					</button>
				</div>
			</div>

			<div v-if="error" class="alert alert-error mt-3"><span>{{ error }}</span></div>

			<div v-if="!loading && logs.length === 0" class="text-sm text-base-content/70">No maintenance logs</div>

            <!-- Maintenance Logs List -->
			<div class="grid gap-3 mt-4">
				<template v-for="log in logs" :key="log.id">
					<MaintenanceLogCard :log="log" @updated="handleUpdated" @deleted="handleDeleted" />
				</template>
			</div>

			<CreateMaintenanceLogModal ref="createModalRef" :aircraft-id="aircraftId" @created="handleCreated" />
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { listMaintenanceLogs, type MaintenanceLogData, type MaintenanceLogType } from '@/api/rest/aircraft_maintenance.api';
import MaintenanceLogCard from '@/components/aircraft_maintenance/MaintenanceLogCard.vue';
import CreateMaintenanceLogModal from '@/components/aircraft_maintenance/CreateMaintenanceLogModal.vue';

const props = defineProps<{ aircraftId: string }>()

const types: MaintenanceLogType[] = ['build', 'maintenance', 'upgrade', 'repair', 'trouble-shooting', 'ground-run', 'other']

const logs = ref<MaintenanceLogData[]>([])
const loading = ref(false)
const error = ref('')
const filters = reactive<{ type?: MaintenanceLogType; order: 'asc' | 'desc' }>({ type: undefined, order: 'desc' })
const createModalRef = ref<InstanceType<typeof CreateMaintenanceLogModal> | null>(null)

async function reload() {
	try {
		loading.value = true
		error.value = ''
		const result = await listMaintenanceLogs(props.aircraftId, { type: filters.type, order: filters.order })
		logs.value = result
	} catch (e: any) {
		error.value = e?.message || 'Failed to load maintenance logs'
	} finally {
		loading.value = false
	}
}

function handleUpdated(updated: MaintenanceLogData) {
	const idx = logs.value.findIndex((l) => l.id === updated.id)
	if (idx !== -1) logs.value[idx] = updated
}

function handleDeleted(id: string) {
	logs.value = logs.value.filter((l) => l.id !== id)
}

function openCreateModal() {
	createModalRef.value?.open()
}

function handleCreated(newLog: MaintenanceLogData) {
	// Prepend when newest first, append when oldest first
	if (filters.order === 'desc') {
		logs.value = [newLog, ...logs.value]
	} else {
		logs.value = [...logs.value, newLog]
	}
}

watch(() => [filters.type, filters.order], reload)
onMounted(reload)
</script>

<style scoped></style>


