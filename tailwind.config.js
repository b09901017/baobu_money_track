/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'macaron-pink': '#FFDFD3',
        'macaron-rose': '#E2C2C6',
        'macaron-blue': '#C4E0E5',
        'macaron-green': '#D4E6B5',
        'macaron-purple': '#E6CEE3',
        'macaron-cream': '#FFF9EE',
        'antique-gold': '#D4AF37',
        'shimmer-gold': '#F9E59E',
        'warm-brown': '#8D7B68',
        'soft-ink': '#5D576B',
        'paper': '#FFFDF7',
        'parchment': '#F2E8D5',
      },
      fontFamily: {
        'display': ['Newsreader', 'serif'],
        'hand': ['Caveat', 'cursive'],
        'sans': ['Quicksand', 'sans-serif'],
        'heading': ['Nunito', 'sans-serif'],
        'script': ['Pacifico', 'cursive'],
      },
      backgroundImage: {
        'watercolor': "radial-gradient(circle at 10% 20%, rgba(255, 223, 211, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(196, 224, 229, 0.4) 0%, transparent 20%), radial-gradient(circle at 50% 50%, rgba(255, 249, 238, 1) 0%, rgba(255, 240, 245, 0.5) 100%)",
      },
      boxShadow: {
        'book': '0 10px 15px -3px rgba(74, 64, 54, 0.2), 0 4px 6px -2px rgba(74, 64, 54, 0.1)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.4)',
        'watercolor-layered': '0 4px 6px -1px rgba(141, 123, 104, 0.1), 0 2px 4px -1px rgba(141, 123, 104, 0.06), 0 0 0 1px rgba(255,255,255,0.5) inset',
        'dreamy': '0 10px 40px -10px rgba(255, 209, 220, 0.6)',
      }
    },
  },
  plugins: [],
}
