/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Professional Color Scheme
        background: '#ffffff',
        foreground: '#333333',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#333333',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#333333',
        },
        primary: {
          DEFAULT: '#0052A3', // Professional Medical Blue
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f5f7f8', // Light Gray Background
          foreground: '#333333',
        },
        muted: {
          DEFAULT: '#f5f7f8',
          foreground: '#666666',
        },
        accent: {
          DEFAULT: '#00aeef', // Light Blue / Cyan
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#e74c3c', // Red
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#2ecc71', // Green
          foreground: '#ffffff',
        },
        border: '#e0e0e0',
        input: '#e0e0e0',
        ring: '#0052A3',

        // Medical specific colors
        medical: {
          blue: '#005baa',
          'blue-light': '#00aeef',
          'blue-dark': '#004080',
          cyan: '#00aeef',
          'cyan-light': '#e6f7ff',
          'cyan-dark': '#0088aa',
          gray: '#666666',
          'gray-light': '#f5f7f8',
          'gray-dark': '#333333',
        },

        // Trust indicators
        trust: {
          gold: '#fbbf24',
          silver: '#e5e7eb',
          bronze: '#d97706',
        },

        chart: {
          1: '#0052A3',
          2: '#00AEEF',
          3: '#27AE60',
          4: '#F39C12',
          5: '#E74C3C',
        },
        sidebar: {
          DEFAULT: '#f5f7f8',
          foreground: '#333333',
          primary: {
            DEFAULT: '#0052A3',
            foreground: '#ffffff',
          },
          accent: {
            DEFAULT: '#00AEEF',
            foreground: '#ffffff',
          },
          border: '#e0e0e0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(14, 165, 233, 0.05)',
      },
    },
  },
  plugins: [],
}