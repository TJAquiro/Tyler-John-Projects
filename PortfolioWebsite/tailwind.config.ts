import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#17231f", paper: "#f5f2ea", moss: "#4e654f", coral: "#e47b5c", accent: "#a84930", line: "#d7d8ce" },
      fontFamily: { display: ["var(--font-display)"], sans: ["var(--font-sans)"] }
    }
  },
  plugins: []
};

export default config;
