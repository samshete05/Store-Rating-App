/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 60px rgba(15, 23, 42, 0.18)",
      },
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#eef2ff",
          200: "#dbeafe",
          300: "#cbd5e1",
          600: "#475569",
          700: "#334155",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
