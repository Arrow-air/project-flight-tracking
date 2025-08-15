<template>
	<div class="card bg-base-200 border-dashed border-2 h-full">
		<div class="card-body items-center justify-center text-center">
			<div class="text-4xl">✈️</div>
			<h3 class="card-title">Create aircraft</h3>
			<p class="text-base-content/70">Add a new aircraft to your fleet</p>
			<div class="card-actions mt-2">
				<button class="btn btn-primary" @click="$emit('create')">New aircraft</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'create'): void }>()
</script>

<style scoped></style>

