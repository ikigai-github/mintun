/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Rubik Variable', 'sans-serif'],
        'logo': ['Rubik Burned', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-280': 'linear-gradient(280deg, var(--tw-gradient-stops))',
      },
    },
  },
  daisyui: {
    themes: [{
      mintun: {
        'primary': '#e879f9',
        'secondary': '#fb7185',
        'accent': '#fecaca',
        'neutral': '#f3f4f6',
        'base-100': '#130F1A',
        'base-200': '#0F0C13',
        'base-300': '#07060F',
        'base-content': '#EFEFEF',
        'info': '#4ade80',
        'success': '#fef3c7',
        'warning': '#ffff00',
        'error': '#ef4444',
        '--navbar-padding': '1rem',
        '--rounded-box': '0.35rem', // border radius rounded-box utility class, used in card and other large boxes
        '--rounded-btn': '0.5rem', // border radius rounded-btn utility class, used in buttons and similar element
        '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
        '--animation-btn': '0.30s', // duration of animation when you click on button
        '--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
        '--btn-focus-scale': '0.90', // scale transform of button when you focus on it
        '--border-btn': '1px', // border width of buttons
        '--tab-border': '1px', // border width of tabs
        '--tab-radius': '0.5rem', // border radius of tabs
      },
    }],
  },
  plugins: [
    require('daisyui'),
    require('@kobalte/tailwindcss')({ prefix: 'kb' }),
  ],
};
