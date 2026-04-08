/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0b0b0f',
        surface:  '#13131a',
        surface2: '#1c1c26',
        surface3: '#242433',
        accent:   '#7c6bff',
        accent2:  '#a08fff',
        border:   'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      }
    }
  },
  plugins: [],
}
