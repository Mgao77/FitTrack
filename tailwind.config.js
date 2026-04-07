/** @type {import('tailwindcss').Config} */
// NOTE: This project uses Tailwind CSS v4 which uses CSS-based configuration.
// The actual theme config is in src/styles/globals.css using @theme directive.
// This file is kept for reference and tooling compatibility.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#121212',
          card: '#1E1E1E',
          elevated: '#2A2A2A',
        },
        accent: {
          red: '#E53935',
          blue: '#42A5F5',
          warning: '#FF9800',
          success: '#66BB6A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          tertiary: '#6B6B6B',
        },
        border: '#333333',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
