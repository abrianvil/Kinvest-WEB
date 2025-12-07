/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          0: '#0A0A0A',
          1: '#121212',
          2: '#1B1B1B',
          3: '#161616',
        },
        accent: {
          tech: '#00F5A0',
          techDim: '#00C97C',
          techSoft: '#00F5A022',
        },
        warm: {
          1: '#C46F3B',
          2: '#A96534',
          soft: '#B1744933',
          light: '#DFCCB4',
        },
        text: {
          primary: '#F3F3F3',
          secondary: '#C8C8C8',
          muted: '#888888',
          warm: '#E0C0AA',
        },
        line: '#2A2A2A',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Space Grotesk', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Space Grotesk', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 45px rgba(0, 0, 0, 0.45)',
        techGlow: '0 0 12px #00F5A033',
        warmGlow: '0 0 10px #B1744933',
      },
      borderRadius: {
        kinSm: '4px',
        kinMd: '8px',
        kinLg: '12px',
        kinXs: '6px',
      },
    },
  },
  plugins: [],
};
