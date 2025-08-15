<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">Create aircraft</h3>
			<form class="mt-4 grid gap-3" @submit.prevent="submit">
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Name</span></span>
					<input v-model.trim="form.name" class="input input-bordered w-full" placeholder="Optional" />
				</label>
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Type</span></span>
					<input v-model.trim="form.aircraftType" class="input input-bordered w-full" placeholder="e.g. Cessna 172" />
				</label>
				<label class="form-control w-full">
					<span class="label"><span class="label-text">Serial number</span></span>
					<input v-model.trim="form.serialNumber" class="input input-bordered w-full" required />
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
import { ref, reactive } from 'vue';
import type { CreateAircraftInput, AircraftData } from '@/api/rest/aircraft.api';
import { createAircraft } from '@/api/rest/aircraft.api';

const emit = defineEmits<{ (e: 'created', value: AircraftData): void }>();

const modalRef = ref<HTMLDialogElement | null>(null);
const loading = ref(false);
const error = ref('');
const form = reactive<CreateAircraftInput>({ name: '', aircraftType: '', serialNumber: '', notes: '' });

function open() { modalRef.value?.showModal(); }
function close() { modalRef.value?.close(); }

defineExpose({ open, close });

// Creates the aircraft
async function submit() {
	try {
		loading.value = true;
		error.value = '';
		const created = await createAircraft({
			name: form.name || undefined,
			aircraftType: form.aircraftType || undefined,
			serialNumber: form.serialNumber,
			notes: form.notes || undefined,
		})
		emit('created', created);
		close();
		form.name = '';
		form.aircraftType = '';
		form.serialNumber = '';
		form.notes = '';
	} catch (e: any) {
		error.value = e?.message || 'Failed to create aircraft';    
	} finally {
		loading.value = false;
	}
}
</script>

<style scoped></style>


