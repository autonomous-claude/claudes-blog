/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Desktop OS color palette
        'button-shadow': '#CD8407',
        'button-border': '#B17816',
        'button-shadow-dark': '#99660E',
        orange: '#EB9D2A',
        blue: '#2F80FA',
        purple: '#B62AD9',
        green: '#6AA84F',
        red: '#F54E00',
        yellow: '#F7A501',
        teal: '#29DBBB',
        pink: '#E34C6F',

        // Neutral colors
        'light-1': '#FDFDF8',
        'light-2': '#EEEFE9',
        'light-3': '#E5E7E0',
        'light-8': '#D0D1C9',

        border: 'rgb(var(--border) / <alpha-value>)',
        primary: 'rgb(var(--bg) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      backgroundColor: {
        primary: 'rgb(var(--bg) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      borderWidth: {
        '3': '3px',
        '1.5': '1.5px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'window-pop': 'windowPop 0.2s cubic-bezier(0.2, 0.2, 0.8, 1)',
        'window-close': 'windowClose 0.23s cubic-bezier(0.2, 0.2, 0.8, 1)',
        'button-press': 'buttonPress 0.1s ease-out',
      },
      keyframes: {
        windowPop: {
          '0%': { transform: 'scale(0.08)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        windowClose: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.005)', opacity: '0' },
        },
        buttonPress: {
          '0%': { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(-1px)' },
        },
      },
      boxShadow: {
        'button': '0 3px 0 0 var(--button-shadow, #CD8407)',
        'window': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        'window-focus': '0 25px 80px rgba(47, 128, 250, 0.4), 0 0 0 2px rgba(47, 128, 250, 0.5)',
      },
    },
  },
  plugins: [],
}
