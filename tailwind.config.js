/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#38f9d7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-card': '#334155',
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-muted': '#64748b',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'success-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'accent-gradient': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'overlay-texture': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};