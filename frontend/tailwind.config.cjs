module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  // Tailwind v4 uses CSS `@plugin` for daisyUI; keep options here if you need them
  daisyui: {
    themes: ["light", "dark"], // or just pick one like ["light"]
  },
}
