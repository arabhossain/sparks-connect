/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D17', // Very dark blue/black
        card: '#151828', // Slightly lighter dark for glass effect
        cardHover: '#1c2035',
        primary: {
          DEFAULT: '#6d28d9', // Deep Purple
          light: '#8b5cf6', // Violet glow
        },
        accent: {
          DEFAULT: '#2563eb', // Royal Blue
          light: '#3b82f6', // Bright Blue glow
        },
        border: 'rgba(255, 255, 255, 0.08)',
        foreground: '#f8fafc',
        muted: '#94a3b8',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
        'glow-accent': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
