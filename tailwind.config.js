/** @type {import('tailwindcss').Config} */
export default {
  // Phase17.5B.5 ships the route boundaries mounted by App.tsx. Historical
  // superseded page/module implementations remain in the lean source for
  // reference, but scanning them emitted unused utility CSS into production.
  content: [
    './index.html',
    './src/App.tsx',
    './src/main.tsx',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/{AssetsPage,ContractDetailsPage,DesignSystemPage,EarnPage,EditProfilePage,HelpPage,NotificationsPage,QoraPage,SettingsPage,TransactionsPage}.{js,ts,jsx,tsx}',
    './src/modules/{achievements,admin,edge,era}/**/*.{js,ts,jsx,tsx}',
    './src/special3/**/*.{js,ts,jsx,tsx}',
    './src/simulator/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        semantic: {
          canvas: 'var(--surface-canvas)',
          recessed: 'var(--surface-recessed)',
          surface: 'var(--surface-default)',
          subtle: 'var(--surface-subtle)',
          overlay: 'var(--surface-overlay)',
          content: 'var(--content-primary)',
          muted: 'var(--content-secondary)',
          disabled: 'var(--content-disabled)',
          brand: 'var(--color-brand)',
          positive: 'var(--color-positive)',
          caution: 'var(--color-caution)',
          negative: 'var(--color-negative)',
        },
        dark: {
          bg: '#070707',
          surface: '#111111',
          card: '#151515',
          border: 'rgba(242,242,238,0.16)',
          textPrimary: '#f2f2ee',
          textSecondary: 'rgba(242,242,238,0.58)',
        },
        light: {
          bg: '#f3f3f1',
          surface: '#ffffff',
          card: '#fafaf8',
          border: 'rgba(9,9,8,0.16)',
          textPrimary: '#090908',
          textSecondary: 'rgba(9,9,8,0.58)',
        },
        primary: {
          DEFAULT: '#5170ff',
          light: '#6b8aff',
          50: 'rgba(81,112,255,0.06)',
          100: 'rgba(81,112,255,0.10)',
          200: 'rgba(81,112,255,0.18)',
          300: 'rgba(81,112,255,0.28)',
          400: '#6b8aff',
          500: '#5170ff',
          600: '#3a5bef',
          700: '#3a5bef',
          800: '#3a5bef',
          900: '#3a5bef',
        },
        accent: { DEFAULT: '#5170ff', light: '#6b8aff' },
        success: { DEFAULT: '#22a06b', light: '#36b37e', subtle: 'rgba(34,160,107,0.12)' },
        warning: { DEFAULT: '#c47f00', light: '#e9a825', subtle: 'rgba(196,127,0,0.13)' },
        danger: { DEFAULT: '#d93f4c', light: '#ef5a67', subtle: 'rgba(217,63,76,0.12)' },
        info: { DEFAULT: '#5170ff', subtle: 'rgba(81,112,255,0.10)' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Eternity', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '2px',
        '2xl': '2px',
        '3xl': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.22s ease-out',
        'slide-up': 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)',
        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 0 rgba(81,112,255,0)' }, '50%': { boxShadow: '0 0 24px rgba(81,112,255,0.20)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
