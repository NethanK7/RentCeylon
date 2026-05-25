import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'white':         '#FFFFFF',
        'snow':          '#F8F9FC',
        'frost':         '#F0F3F9',
        'mist':          '#E4EAF4',
        'ink':           '#0C1124',
        'slate':         '#3D4F73',
        'fog':           '#8A97B5',
        'navy':          '#0F2456',
        'royal':         '#1A3D8F',
        'royal-light':   '#EEF2FB',
        'royal-dark':    '#122D6B',
        'sky':           '#4A7FD4',
        'gold':          '#C9973A',
        'gold-light':    '#F9F1E2',
        'gold-pale':     '#FDF7ED',
        'gold-dark':     '#A67928',
        'gold-shine':    '#E8BC6A',
        'success':       '#0A7855',
        'warning':       '#C47B04',
        'danger':        '#B91C1C',
        'border':        '#DDE3F0',
        'border-strong': '#C4CEEA',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        heading: ['var(--font-dm-serif)', 'serif'],
        sans: ['var(--font-geist)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3.5rem, 9vw, 8rem)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'section': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.1' }],
        'card-title': ['1.25rem', { lineHeight: '1.3' }],
        'price': ['1.5rem', { lineHeight: '1' }],
        'label': ['0.875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'section': 'clamp(5rem, 10vw, 10rem)',
      },
      borderRadius: {
        'card': '2px',
        'sm': '2px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(15,36,86,0.04), 0 0 0 1px rgba(15,36,86,0.06)',
        'card-hover': '0 8px 32px rgba(15,36,86,0.10), 0 0 0 1px rgba(26,61,143,0.12)',
        'nav': '0 1px 0 rgba(12,17,36,0.08)',
        'gold': '0 4px 16px rgba(201,151,58,0.3)',
        'focus-gold': '0 0 0 2px rgba(201,151,58,0.4)',
      },
      keyframes: {
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        drawLine: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'gold-shimmer': 'goldShimmer 3s linear infinite',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'draw-line': 'drawLine 0.8s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
