import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        surface: "rgba(255, 255, 255, 0.04)",
        "surface-hover": "rgba(255, 255, 255, 0.07)",
        "surface-active": "rgba(255, 255, 255, 0.10)",
        border: "rgba(255, 255, 255, 0.08)",
        "border-hover": "rgba(255, 255, 255, 0.16)",
        text: "#F4F4F5",
        muted: "#A1A1AA",
        violet: {
          DEFAULT: "#7C5CFF",
          glow: "rgba(124, 92, 255, 0.35)",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          glow: "rgba(34, 211, 238, 0.35)",
        },
        mint: {
          DEFAULT: "#5EEAD4",
          glow: "rgba(94, 234, 212, 0.35)",
        },
        danger: {
          DEFAULT: "#F87171",
          glow: "rgba(248, 113, 113, 0.35)",
        },
        warn: {
          DEFAULT: "#FBBF24",
          glow: "rgba(251, 191, 36, 0.35)",
        },
      },
      borderRadius: {
        "12": "12px",
        "16": "16px",
        "24": "24px",
        card: "16px",
        container: "24px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "display-hero": ["clamp(2.75rem, 6vw + 1rem, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-h1": ["clamp(2.25rem, 4.5vw + 0.75rem, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.035em" }],
        "display-h2": ["clamp(1.75rem, 3.2vw + 0.5rem, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.03em" }],
        "display-h3": ["clamp(1.35rem, 2.2vw + 0.25rem, 2rem)", { lineHeight: "1.25", letterSpacing: "-0.025em" }],
        "display-h4": ["clamp(1.15rem, 1.4vw + 0.25rem, 1.5rem)", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        "glow-violet": "0 0 25px -5px rgba(124, 92, 255, 0.3)",
        "glow-cyan": "0 0 25px -5px rgba(34, 211, 238, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
