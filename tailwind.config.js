/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        // acento (teal-petróleo)
        brand: {
          DEFAULT: "#0f6b6b",
          hover: "#0c5757",
          fg: "#ffffff",
          subtle: "#e6f0f0",
          muted: "#4f8a8a",
        },
        // neutros
        ink: "#1f2937",
        muted: "#6b7280",
        line: "#e5e7eb",
        surface: "#ffffff",
        ground: "#f5f7f7",
        // semânticas (só status)
        ok: { DEFAULT: "#15803d", subtle: "#dcfce7" },
        warn: { DEFAULT: "#b45309", subtle: "#ffedd5" },
        danger: { DEFAULT: "#dc2626", subtle: "#fee2e2" },
        info: { DEFAULT: "#2f5d8a", subtle: "#dbeafe" },
      },
      // raios menos bulbosos: encolhe os grandes, mantém os pequenos
      borderRadius: {
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(16 24 40 / 0.04), 0 1px 3px rgb(16 24 40 / 0.06)",
        pop: "0 4px 12px rgb(16 24 40 / 0.08), 0 2px 4px rgb(16 24 40 / 0.06)",
      },
    },
  },
  plugins: [],
}
