import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: "#1B1E24",
          light: "#2A2E37",
          50: "#F5F6F8",
        },
        steel: {
          50: "#F5F6F8",
          100: "#E9EBEF",
          200: "#DADDE3",
          300: "#C2C6CE",
        },
        ink: "#20242B",
        cyan: {
          DEFAULT: "#14B8E0",
          deep: "#0A6E8C",
          50: "#E6F8FC",
        },
        spark: {
          DEFAULT: "#F2A23C",
          deep: "#B5701B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        container: "1240px",
      },
    },
  },
  plugins: [],
};
export default config;
