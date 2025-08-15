<template>
	<section class="max-w-6xl mx-auto px-6 py-8">

        <!-- Aircraft List Header -->
		<div class="flex items-end justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold">Your Aircraft</h1>
				<p class="text-base-content/70">Your fleet to manage</p>
			</div>
			<button class="btn btn-primary" @click="openCreateModal">
				<span class="mr-1">+</span>
				<span>New aircraft</span>
			</button>
		</div>

		<div v-if="error" class="alert alert-error mb-4">
			<span>{{ error }}</span>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<CreateAircraftCard @create="openCreateModal" />

            <!-- Aircraft List -->
			<template v-for="ac in aircraft" :key="ac.id">
				<AircraftCard :aircraft="ac">
					<template #actions>
						<RouterLink class="btn btn-ghost btn-sm" :to="{ name: 'Aircraft', params: { id: ac.id } }">Open</RouterLink>
					</template>
				</AircraftCard>
			</template>
		</div>

		<CreateAircraftModal ref="createModalRef" @created="handleCreated" />
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listAircraft, type AircraftData } from '@/api/rest/aircraft.api'
import CreateAircraftCard from '@/components/aircraft/CreateAircraftCard.vue'
import AircraftCard from '@/components/aircraft/AircraftCard.vue'
import CreateAircraftModal from '@/components/aircraft/CreateAircraftModal.vue'

const aircraft = ref<AircraftData[]>([])
const error = ref('')
const createModalRef = ref<InstanceType<typeof CreateAircraftModal> | null>(null)

async function fetchAircraft() {
	try {
		const rows = await listAircraft()
		aircraft.value = rows
	} catch (e: any) {
		error.value = e?.message || 'Failed to load aircraft'
	}
}

function openCreateModal() {
	createModalRef.value?.open()
}

async function handleCreated(newAircraft: AircraftData) {
	// Optimistically add to the top
	aircraft.value = [newAircraft, ...aircraft.value]
}

onMounted(fetchAircraft)
</script>

<style scoped></style>


