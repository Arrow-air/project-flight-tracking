<template>
	<div class="min-h-screen bg-base-100 flex flex-col">
		<HeaderBar />
		<main class="flex-1">
			<slot />
		</main>
		<FooterBar />
	</div>
</template>

<script setup lang="ts"></script>

<style scoped></style>

