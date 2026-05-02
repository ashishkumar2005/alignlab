/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f0f13",
        panel: "#1a1a24",
        panelSoft: "#222232",
        accent: "#8b5cf6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(139, 92, 246, 0.18)",
      },
    },
  },
  plugins: [],
};
