/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{ts,tsx,js,jsx}',
],
theme: {
extend: {
      colors: { 
        charcoal: '#0d1110',
        'charcoal-light': '#161c1a',
        'charcoal-lighter': '#1f2725'
      },
container: { center: true, padding: '1rem' },
},
},
plugins: [],
}
