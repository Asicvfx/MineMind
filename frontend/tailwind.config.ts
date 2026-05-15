import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        card: 'hsl(var(--color-card) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--color-secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--color-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--color-destructive-foreground) / <alpha-value>)',
        },
        safe: {
          DEFAULT: 'hsl(var(--color-safe) / <alpha-value>)',
          foreground: 'hsl(var(--color-safe-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)',
          foreground: 'hsl(var(--color-warning-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--color-border) / <alpha-value>)',
        input: 'hsl(var(--color-input) / <alpha-value>)',
        ring: 'hsl(var(--color-ring) / <alpha-value>)',
        cell: {
          1: '#00ddff',
          2: '#00ff88',
          3: '#ff5577',
          4: '#aa66ff',
          5: '#ff8844',
          6: '#00ffcc',
          7: '#ffffff',
          8: '#888899',
        },
        brand: {
          50: '#E0FFF9',
          100: '#B3FFEF',
          200: '#80FFE3',
          300: '#4DFFD8',
          400: '#1AFFCC',
          500: '#00ffd5',
          600: '#00CCAA',
          700: '#00997F',
          800: '#006655',
          900: '#00332A',
          950: '#001A15',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 213, 0.4), 0 0 40px rgba(0, 255, 213, 0.2)',
        'glow-secondary': '0 0 20px rgba(255, 0, 170, 0.4), 0 0 40px rgba(255, 0, 170, 0.2)',
        'glow-accent': '0 0 20px rgba(85, 85, 255, 0.4)',
        'glow-safe': '0 0 20px rgba(0, 255, 102, 0.5)',
        'glow-mine': '0 0 20px rgba(255, 51, 85, 0.5)',
        'glow-warning': '0 0 20px rgba(255, 238, 0, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float-delayed 3s ease-in-out infinite 0.5s',
        'cell-reveal': 'cell-reveal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'mine-explode': 'mine-explode 0.5s ease-out forwards',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px #00ffd5, 0 0 20px rgba(0, 255, 213, 0.3)',
            filter: 'brightness(1)',
          },
          '50%': {
            boxShadow: '0 0 10px #00ffd5, 0 0 40px rgba(0, 255, 213, 0.5), 0 0 60px rgba(0, 255, 213, 0.3)',
            filter: 'brightness(1.1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'cell-reveal': {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'mine-explode': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '20%': { transform: 'scale(1.4)', filter: 'brightness(2)' },
          '40%': { transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.2)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
}
