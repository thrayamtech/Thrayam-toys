module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // #F7EFE5 — Warm linen/cream: handcrafted, natural, artisan feel
        skin: {
          DEFAULT: '#F7EFE5',
          50:  '#FDFAF6',
          100: '#F7EFE5',
          200: '#EDD8C0',
          300: '#DFC09A',
          400: '#CFA676',
        },
        // #6B4226 — Medium wood brown: warmth, craftsmanship, trustworthy
        wood: {
          DEFAULT: '#6B4226',
          light:   '#8C5A35',
          dark:    '#4A2D18',
          50:  '#F9F3EE',
          100: '#EDD8C8',
          200: '#D4AD8E',
          300: '#B8835A',
          400: '#8C5A35',
          500: '#6B4226',
          600: '#4A2D18',
          700: '#2F1E14',
        },
        // #2F1E14 — Dark espresso/walnut: premium text, depth, contrast
        espresso: {
          DEFAULT: '#2F1E14',
          light:   '#4A2D18',
          900:     '#2F1E14',
          800:     '#3D2718',
          700:     '#54341F',
        },
        // #8FAF9D — Muted sage green: nature, eco, safe, non-toxic
        sage: {
          DEFAULT: '#8FAF9D',
          50:  '#F0F5F2',
          100: '#D6E8DE',
          200: '#B5D4C4',
          300: '#8FAF9D',
          400: '#6B9480',
          500: '#4F7A65',
          600: '#3A5F4C',
          700: '#274336',
        },
        // #DDBB72 — Golden amber/honey: warmth, premium, natural wood
        gold: {
          DEFAULT: '#DDBB72',
          50:  '#FBF7EC',
          100: '#F4EAC8',
          200: '#EBD89A',
          300: '#DDBB72',
          400: '#CC9F48',
          500: '#B07F2A',
          600: '#8A6120',
        },
        // #C96A4A — Terracotta/rust: earthy energy, inviting CTAs
        terra: {
          DEFAULT: '#C96A4A',
          50:  '#FBF2EE',
          100: '#F5D8CC',
          200: '#EAB098',
          300: '#DB8565',
          400: '#C96A4A',
          500: '#A8512F',
          600: '#833C22',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out',
        'marquee':    'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'soft':    '0 2px 16px rgba(47,30,20,0.08)',
        'medium':  '0 4px 24px rgba(47,30,20,0.12)',
        'strong':  '0 8px 40px rgba(47,30,20,0.16)',
        'terra':   '0 4px 20px rgba(201,106,74,0.30)',
        'sage':    '0 4px 20px rgba(143,175,157,0.35)',
      },
    },
  },
  plugins: [],
}
