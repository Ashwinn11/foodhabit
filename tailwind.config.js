/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F0F7F2',
        surface: '#FFFFFF',
        border: '#D4EAD9',
        primary: {
          DEFAULT: '#2D7A52',
          light: '#E6F5EC',
          mid: '#B8DFC8',
        },
        amber: {
          DEFAULT: '#C8821A',
          light: '#FEF3DC',
        },
        red: {
          DEFAULT: '#C0392B',
          light: '#FDE8E6',
        },
        text1: '#1C2B20',
        text2: '#6B8C72',
        text3: '#A8BFAC',
        cream: '#FDFAF4',
        stone: '#E8E2D6',
        dark: '#1C2B20',
        gradient: {
          start: '#EDFAF2',
          mid: '#FDFAF4',
          end: '#F5F0FF',
        },
      },
      fontFamily: {
        'figtree-black': ['Figtree_900Black'],
        'figtree-extrabold': ['Figtree_800ExtraBold'],
        'figtree-bold': ['Figtree_700Bold'],
        'figtree-semibold': ['Figtree_600SemiBold'],
        'figtree-medium': ['Figtree_500Medium'],
        'figtree': ['Figtree_400Regular'],
        'mono-bold': ['DMMono_700Bold'],
        'mono-medium': ['DMMono_500Medium'],
        'mono': ['DMMono_400Regular'],
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        'btn-sm': '10px',
        chip: '999px',
        tab: '10px',
        input: '12px',
      },
      fontSize: {
        'screen-title': ['20px', { letterSpacing: -0.5, fontWeight: '900' }],
        'food-name': ['12px', { fontWeight: '800' }],
        'tab-label': ['8.5px', { fontWeight: '700' }],
        'badge': ['8.5px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
