/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
      },
      colors: {
        primary: { 50: "#eef6ff", 100: "#d9ecff", 200: "#bcdcff", 300: "#8ec5ff", 400: "#59a4ff", 500: "#2f7dff", 600: "#1a5ff0", 700: "#1549d6", 800: "#173dad", 900: "#183688", 950: "#102152" },
        accent: { 50: "#ecfbff", 100: "#cff4ff", 200: "#a3e8ff", 300: "#66d6ff", 400: "#22bdff", 500: "#02a5f0", 600: "#0082cd", 700: "#0068a6", 800: "#055a88", 900: "#0b4b71", 950: "#073049" },
        success: { 400: "#34d399", 500: "#10b981", 600: "#059669" },
        warning: { 400: "#fbbf24", 500: "#f59e0b" },
        error: { 400: "#f87171", 500: "#ef4444" },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pulse-glow": { "0%, 100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
