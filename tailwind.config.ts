import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C12",
        surface: "#0F1520",
        surface2: "#141C2A",
        border: "#1E2738",
        foreground: "#E8ECF2",
        muted: "#7D8799",
        primary: {
          DEFAULT: "#0052FF",
          foreground: "#FFFFFF",
          dark: "#0041CC",
        },
        accent: {
          DEFAULT: "#00E87A",
          foreground: "#021A0E",
          dark: "#00C060",
        },
        warning: "#F5B544",
        danger: "#FF5C5C",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,82,255,0.3), 0 0 20px rgba(0,82,255,0.2)",
        "glow-accent": "0 0 0 1px rgba(0,232,122,0.3), 0 0 20px rgba(0,232,122,0.15)",
        sm: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundOpacity: {
        "8": "0.08",
      },
    },
  },
  plugins: [],
};

export default config;
