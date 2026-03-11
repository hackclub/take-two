import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './lib/**/*.{ts,tsx}', './mdx-components.tsx'],
  theme: {
    extend: {
      colors: {
        grub: {
          bg: '#282828',
          bg1: '#3c3836',
          bg2: '#504945',
          bg3: '#665c54',
          bg4: '#7c6f64',
          fg: '#ebdbb2',
          fg0: '#fbf1c7',
          fg2: '#d5c4a1',
          fg3: '#bdae93',
          fg4: '#a89984',
          red: '#fb4934',
          green: '#b8bb26',
          yellow: '#fabd2f',
          blue: '#83a598',
          purple: '#d3869b',
          aqua: '#8ec07c',
          orange: '#fe8019',
        },
      },
      typography: {
        gruvbox: {
          css: {
            '--tw-prose-body': '#d5c4a1',
            '--tw-prose-headings': '#fbf1c7',
            '--tw-prose-links': '#83a598',
            '--tw-prose-bold': '#ebdbb2',
            '--tw-prose-counters': '#a89984',
            '--tw-prose-bullets': '#a89984',
            '--tw-prose-hr': '#504945',
            '--tw-prose-quotes': '#bdae93',
            '--tw-prose-quote-borders': '#504945',
            '--tw-prose-code': '#fe8019',
            '--tw-prose-pre-bg': '#3c3836',
            '--tw-prose-pre-code': '#ebdbb2',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
