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
        // Beer Team Colors - Paleta basada en el nuevo logo
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  // Fucsia principal
          600: '#db2777',  // Fucsia oscuro
          700: '#be185d',  // Fucsia más oscuro
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Dorado
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Verde esmeralda
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Paleta Beer Team específica del logo
        'beer-magenta': '#ec4899',    // Fucsia principal del logo
        'beer-gold': '#fbbf24',       // Dorado del logo
        'beer-emerald': '#22c55e',    // Verde esmeralda de las plumas
        'beer-crimson': '#dc2626',    // Rojo carmesí decorativo
        'beer-cream': '#fefce8',      // Crema de la cerveza
        'beer-black': '#0f172a',      // Negro suave para texto
        
        // Estados adaptados a la nueva paleta
        'success': '#22c55e',   // Verde esmeralda
        'warning': '#fbbf24',   // Dorado
        'error': '#dc2626',     // Rojo carmesí
        'info': '#ec4899',      // Fucsia principal
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-magenta': 'pulseMagenta 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        pulseMagenta: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'beer': '0 4px 6px -1px rgba(236, 72, 153, 0.1), 0 2px 4px -1px rgba(236, 72, 153, 0.06)',
        'beer-lg': '0 10px 15px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)',
        'gold': '0 4px 6px -1px rgba(251, 191, 36, 0.1), 0 2px 4px -1px rgba(251, 191, 36, 0.06)',
        'emerald': '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
      },
      gradients: {
        'beer-primary': 'linear-gradient(135deg, #ec4899 0%, #fbbf24 100%)',    // Fucsia a dorado
        'beer-secondary': 'linear-gradient(135deg, #fbbf24 0%, #22c55e 100%)',  // Dorado a verde
        'beer-dark': 'linear-gradient(135deg, #be185d 0%, #92400e 100%)',       // Fucsia oscuro a dorado oscuro
      },
    },
  },
  plugins: [],
} satisfies Config; 