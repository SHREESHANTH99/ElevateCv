/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{ts,tsx,js,jsx}',
],
theme: {
extend: {
container: { center: true, padding: '1rem' },
},
},
plugins: [],
}