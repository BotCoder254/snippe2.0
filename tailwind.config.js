/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // use 'class' strategy for dark/light toggle
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7C3AED',
          DEFAULT: '#7C3AED',
          dark: '#C084FC',
        },
        secondary: {
          light: '#FBBF24',
          DEFAULT: '#FBBF24',
          dark: '#FACC15',
        },
        info: {
          light: '#22D3EE',
          DEFAULT: '#22D3EE',
          dark: '#38BDF8',
        },
        success: {
          light: '#16A34A',
          DEFAULT: '#16A34A',
          dark: '#4ADE80',
        },
        warning: {
          light: '#EAB308',
          DEFAULT: '#EAB308',
          dark: '#FACC15',
        },
        danger: {
          light: '#DC2626',
          DEFAULT: '#DC2626',
          dark: '#F87171',
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937',
        },
        text: {
          primary: {
            light: '#111827',
            dark: '#F9FAFB',
          },
          secondary: {
            light: '#6B7280',
            dark: '#9CA3AF',
          }
        },
        border: {
          light: '#E5E7EB',
          dark: '#374151',
        },
        highlight: {
          light: '#A3E635',
          dark: '#84CC16',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        cardDark: '0 2px 12px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
