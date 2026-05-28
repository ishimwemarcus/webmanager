/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs':  '380px',   // Large phones
      'sm':  '640px',   // Small tablets / landscape phones
      'md':  '768px',   // Tablets
      'lg':  '1024px',  // Small laptops
      'xl':  '1280px',  // Laptops / desktops
      '2xl': '1536px',  // Large monitors
      '3xl': '1920px',  // Full HD / 1080p
      '4xl': '2560px',  // 1440p / 4K
    },
    extend: {
      colors: {
        'navy-brand': '#10B981',
        'bg-soft': '#F1F5F9',
        'success-pro': '#10B981',
        'warning-pro': '#F59E0B',
        'danger-pro':  '#EF4444',
        'charcoal':    '#0F172A',
        'pure-black':  '#0F172A',
        'blue-gray':   '#64748B',
        navy: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        emerald: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
      },
      fontSize: {
        'xxs':  ['0.625rem', { lineHeight: '0.875rem' }],
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',     { lineHeight: '1' }],
      },
      fontFamily: {
        sans:    ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      borderOpacity: {
        8:  '0.08',
        12: '0.12',
        15: '0.15',
      },
      animation: {
        'bounce-gentle':  'bounceGentle 3s ease-in-out infinite',
        'pulse-gentle':   'pulseGently 4s ease-in-out infinite',
        'fade-in-up':     'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':       'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':       'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'scan':           'scan 3s ease-in-out infinite',
        'shimmer':        'shimmer 1.8s infinite linear',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        pulseGently: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.75' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%':   { top: '0' },
          '100%': { top: '100%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      boxShadow: {
        'glow-green':  '0 0 16px rgba(16,185,129,0.4)',
        'glow-amber':  '0 0 16px rgba(245,158,11,0.4)',
        'glow-red':    '0 0 16px rgba(239,68,68,0.4)',
        'glass':       '0 4px 24px -4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
        'card':        '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
