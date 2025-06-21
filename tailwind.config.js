/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints (320px - 768px focus)
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '414px',
        'lg': '768px',
        'xl': '1024px',
      },
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Colors optimized for mobile displays
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Status colors for financial transfers
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        pending: '#6b7280',
      },
      // Mobile-friendly typography
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
      },
      // Touch-friendly interactions
      minHeight: {
        'touch': '44px', // iOS minimum touch target
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [
    // Add forms plugin for better form styling
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} 