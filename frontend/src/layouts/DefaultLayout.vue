<template>
    <HeaderBar />

    <!-- Main Body Content -->
	<AppShell>
		<router-view />
	</AppShell>
    
    <FooterBar />
</template>

<script setup lang="ts">
import HeaderBar from '@/components/site/HeaderBar.vue';
import FooterBar from '@/components/site/FooterBar.vue';
import AppShell from '@/components/site/AppShell.vue';


</script>

<style scoped></style>


