/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{ts,tsx,js,jsx}',
],
theme: {
extend: {
      fontFamily: {
        display: ['"Aalto Display"', 'Aalto', '"Bricolage Grotesk"', '"Space Grotesk"', 'Outfit', 'sans-serif'],
        aalto: ['"Aalto Display"', 'Aalto', '"Bricolage Grotesk"', '"Space Grotesk"', 'Outfit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
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
