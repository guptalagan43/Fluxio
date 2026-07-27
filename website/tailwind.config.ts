import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        stone: {
          100: '#edede9',
          200: '#d6ccc2',
          300: '#f5ebe0',
          400: '#e3d5ca',
          500: '#d5bdaf',
        },
        text: {
          primary:   '#1a1714',
          secondary: '#5a524a',
          muted:     '#8c8078',
          inverse:   '#f5ebe0',
        },
        accent: {
          DEFAULT: '#5c4a3a',
          hover:   '#3d3028',
        },
        success: {
          DEFAULT: '#4a7c59',
          bg:      '#eaf0e9',
        },
        warning: {
          DEFAULT: '#8a6a2a',
          bg:      '#f5edda',
        },
        error: {
          DEFAULT: '#8a3a3a',
          bg:      '#f0e8e8',
        },
      },

      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        'display':  ['48px', { lineHeight: '1.1', fontWeight: '600' }],
        'h1':       ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2':       ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body':     ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'label':    ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'caption':  ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      borderRadius: {
        none:    '0',
        DEFAULT: '0',
        full:    '9999px',
      },

      spacing: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
      },

      maxWidth: {
        content: '1100px',
        narrow:  '640px',
        popup:   '320px',
      },

      transitionDuration: {
        fast:   '150ms',
        normal: '250ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
