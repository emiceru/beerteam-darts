import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beer Team Colors
        primary: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#ff3b3b',
          600: '#ed1515',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
          950: '#4b0505',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fed27a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        // Paleta Beer Team específica
        'beer-red': '#DC143C',
        'beer-gold': '#FFD700',
        'beer-cream': '#FFF8DC',
        'beer-black': '#000000',
        // Estados
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'beer': '0 4px 6px -1px rgba(220, 20, 60, 0.1), 0 2px 4px -1px rgba(220, 20, 60, 0.06)',
        'beer-lg': '0 10px 15px -3px rgba(220, 20, 60, 0.1), 0 4px 6px -2px rgba(220, 20, 60, 0.05)',
      },
      gradients: {
        'beer-primary': 'linear-gradient(135deg, #DC143C 0%, #FFD700 100%)',
        'beer-dark': 'linear-gradient(135deg, #881414 0%, #92400e 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config; 