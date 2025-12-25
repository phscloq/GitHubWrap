/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgroundDark: "#0B0D10",
        backgroundLight: "#F5F7FA",
        textPrimaryDark: "#FFFFFF",
        textPrimaryLight: "#0B0D10",
        textSecondary: "#8A8F98",
        borderSubtle: "rgba(255,255,255,0.08)",
        accentJS: "#F7DF1E",
        accentPython: "#3572A5",
        accentRust: "#DEA584",
        accentDefault: "#7C7CFF"
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'], // Proxy for Satoshi/General Sans
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '32px',
        xl: '64px',
        xxl: '128px',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
