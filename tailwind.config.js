/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        win11: {
          bgDark: "var(--win11-bg)",
          cardDark: "var(--win11-card)",
          borderDark: "var(--win11-border)",
          bgLight: "#f3f3f3",
          cardLight: "#ffffff",
          borderLight: "#e5e5e5",
          accent: "#0078d4",
          accentHover: "#005a9e"
        }
      }
    },
  },
  plugins: [],
}
