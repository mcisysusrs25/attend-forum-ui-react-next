import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6768ee",
        secondary: "#000000",
        background: "rgb(var(--background) / <alpha-value>)", // Use `rgb()` for CSS vars
        foreground: "rgb(var(--foreground) / <alpha-value>)", // Use `rgb()` for CSS vars
      },
    },
  },
  plugins: [],
};

export default config;
