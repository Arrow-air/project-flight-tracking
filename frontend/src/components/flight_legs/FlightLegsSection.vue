<template>
	<section class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="flex items-end justify-between gap-3">
				<h2 class="card-title">Flight legs</h2>
				<div class="flex items-center gap-2">
					<select v-model="filters.order" class="select select-bordered select-sm">
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
					<button class="btn btn-primary btn-sm" @click="openCreateModal">New</button>
					<button class="btn btn-ghost btn-sm" @click="reload" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Refresh</span>
					</button>
				</div>
			</div>

			<div v-if="error" class="alert alert-error mt-3"><span>{{ error }}</span></div>
			<div v-if="!loading && legs.length === 0" class="text-sm text-base-content/70">No flight legs</div>

			<div class="grid gap-3 mt-4">
				<template v-for="leg in legs" :key="leg.id">
					<FlightLegCard :leg="leg" />
				</template>
			</div>

			<CreateFlightLegModal ref="createModalRef" @created="handleCreated" />
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { listFlightLegs, type FlightLegData } from '@/api/rest/flight_legs.api'
import FlightLegCard from '@/components/flight_legs/FlightLegCard.vue'
import CreateFlightLegModal from '@/components/flight_legs/CreateFlightLegModal.vue'

const legs = ref<FlightLegData[]>([])
const loading = ref(false)
const error = ref('')
const filters = reactive<{ order: 'asc' | 'desc' }>({ order: 'desc' })
const createModalRef = ref<InstanceType<typeof CreateFlightLegModal> | null>(null)

async function reload() {
	try {
		loading.value = true
		error.value = ''
		legs.value = await listFlightLegs({ order: filters.order })
	} catch (e: any) {
		error.value = e?.message || 'Failed to load flight legs'
	} finally {
		loading.value = false
	}
}

function openCreateModal() { createModalRef.value?.open() }
function handleCreated(newLeg: FlightLegData) {
	if (filters.order === 'desc') legs.value = [newLeg, ...legs.value]
	else legs.value = [...legs.value, newLeg]
}

watch(() => filters.order, reload)
onMounted(reload)
</script>

<style scoped></style>

