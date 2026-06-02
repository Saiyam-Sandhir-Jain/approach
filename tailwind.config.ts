import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        accent:     '#FF4500',
        'accent-lo': 'rgba(255,69,0,0.15)',
      },
      animation: {
        'ping-slow': 'ping 2.4s cubic-bezier(0,0,0.2,1) infinite',
        'fade-up':   'fadeUp 0.4s ease both',
        'slide-in':  'slideIn 0.35s ease both',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'none' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'none' } },
      },
      maxWidth: { crm: '1100px' },
    },
  },
  plugins: [],
}

export default config
