import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", "./src/**/*.{js,jsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{html,js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [nextui()],
  darkMode: 'class',
}

