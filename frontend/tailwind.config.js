/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          slate: '#1E293B',
          gold: '#F59E0B',
          emerald: '#10B981',
          rose: '#EF4444',
          ghost: '#F8FAFC',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.2)',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }
    },
  },
  plugins: [],
}
