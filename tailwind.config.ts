import type { Config } from "tailwindcss";

const config: Config = {
  // Цей рядок є критично важливим! Він змушує Tailwind реагувати на клас 'dark' від нашої кнопки
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;