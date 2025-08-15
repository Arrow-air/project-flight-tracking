<template>
	<footer class="footer footer-center bg-base-200 text-base-content p-6">
		<aside>
			<p>© {{ year }} Arrow Air · All rights reserved</p>
		</aside>
	</footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const year = computed(() => new Date().getFullYear());
</script>

<style scoped></style>


