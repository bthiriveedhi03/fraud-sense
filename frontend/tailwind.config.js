/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js}',
    './pages/**/*.vue',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base surfaces - near-black slate, not pure black
        ink: {
          950: '#0A0D11',
          900: '#0F1318',
          800: '#161B21',
          700: '#1E242B',
          600: '#2A323B',
        },
        // Text
        fog: {
          100: '#E7EAED',
          300: '#AEB6BE',
          500: '#7C8792',
        },
        // Risk tiers - the only saturated colors in the palette
        risk: {
          low: '#3FB68B',
          mid: '#E0A845',
          high: '#E0524A',
        },
        signal: '#4FA8D8',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
