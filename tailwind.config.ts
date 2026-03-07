/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. CRITICAL: Enables class-based dark mode switching (for next-themes)
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // 2. Map the primary background/foreground variables
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Map the Geist fonts to utility classes
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)"],
        mono: ["var(--font-inter)"],
        cursive: ["var(--font-playfair-display)"],
      },
    },
  },
  plugins: ["@tailwindcss/typography"],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
};
