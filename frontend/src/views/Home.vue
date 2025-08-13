<template>
	<div class="min-h-screen bg-base-100">
		<!-- Navbar -->
		<div class="navbar bg-base-100/70 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
			<div class="flex-1">
				<a class="btn btn-ghost text-xl">Arrow Air • Flight Tracking</a>
			</div>
			<div class="flex-none gap-2">
				<label class="swap swap-rotate" aria-label="Toggle theme">
					<input type="checkbox" class="theme-controller" value="dark" />
					<!-- sun -->
					<svg class="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M5 12a7 7 0 1 0 14 0A7 7 0 0 0 5 12m7-9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1m0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1M1 13a1 1 0 1 1 0-2H2a1 1 0 1 1 0 2zm20 0a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2zM4.222 5.636a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 5.636 6.343zM17.657 19.071a1 1 0 0 1 1.414-1.415l.707.708a1 1 0 0 1-1.414 1.414zM4.222 18.364a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.415l-.707-.708a1 1 0 0 1 0-1.414M18.364 4.222a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.415l-.707-.708a1 1 0 0 1 0-1.414"/>
					</svg>
					<!-- moon -->
					<svg class="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79"/>
					</svg>
				</label>
				<a href="/login" class="btn btn-primary">Get started</a>
			</div>
		</div>

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

		<!-- Footer -->
		<footer class="footer footer-center bg-base-200 text-base-content p-6">
			<aside>
				<p>© {{ new Date().getFullYear() }} Arrow Air · All rights reserved</p>
			</aside>
		</footer>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped></style>

