<template>
    <div class="min-h-screen bg-base-100">
        <!-- Hero -->
		<section class="hero py-16">
			<div class="hero-content text-center">
				<div class="max-w-3xl">
					<h1 class="text-5xl md:text-6xl font-bold leading-tight">
						Real‑time Flight Tracking
					</h1>
					<p class="py-6 text-base-content/70">
						Track aircraft, flight legs, logs, and notes in one place. Built with Vue 3, Tailwind CSS, daisyUI, and Supabase.
					</p>
					<div class="join">
						<a class="btn btn-primary join-item" href="/login">Log in</a>
						<a class="btn btn-outline join-item" href="/signup">Create account</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section class="max-w-6xl mx-auto px-6 pb-16">
			<div class="grid gap-6 md:grid-cols-3">
				<div class="card bg-base-200 shadow">
					<div class="card-body">
						<div class="text-3xl">✈️</div>
						<h3 class="card-title">Aircraft</h3>
						<p>Manage fleet hardware, types, and maintenance logs.</p>
					</div>
				</div>
				<div class="card bg-base-200 shadow">
					<div class="card-body">
						<div class="text-3xl">🧭</div>
						<h3 class="card-title">Flight legs</h3>
						<p>Plan legs, add tags and notes, and monitor status in real time.</p>
					</div>
				</div>
				<div class="card bg-base-200 shadow">
					<div class="card-body">
						<div class="text-3xl">📊</div>
						<h3 class="card-title">Insights</h3>
						<p>See utilization and operational metrics at a glance.</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Stats -->
		<section class="max-w-6xl mx-auto px-6 pb-20">
			<div class="stats shadow bg-base-200 w-full">
				<div class="stat">
					<div class="stat-title">Active aircraft</div>
					<div class="stat-value">12</div>
					<div class="stat-desc">Demo data</div>
				</div>
				<div class="stat">
					<div class="stat-title">Today's legs</div>
					<div class="stat-value">34</div>
					<div class="stat-desc">+4 since yesterday</div>
				</div>
				<div class="stat">
					<div class="stat-title">On‑time rate</div>
					<div class="stat-value">96%</div>
					<div class="stat-desc">Last 24h</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped></style>

