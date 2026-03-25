import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './lib/**/*.{ts,tsx}', './mdx-components.tsx'],
  theme: {
    extend: {
      colors: {
        grub: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          bg1: 'rgb(var(--color-bg1) / <alpha-value>)',
          bg2: 'rgb(var(--color-bg2) / <alpha-value>)',
          bg3: 'rgb(var(--color-bg3) / <alpha-value>)',
          bg4: 'rgb(var(--color-bg4) / <alpha-value>)',
          fg: 'rgb(var(--color-fg) / <alpha-value>)',
          fg0: 'rgb(var(--color-fg0) / <alpha-value>)',
          fg2: 'rgb(var(--color-fg2) / <alpha-value>)',
          fg3: 'rgb(var(--color-fg3) / <alpha-value>)',
          fg4: 'rgb(var(--color-fg4) / <alpha-value>)',
          red: 'rgb(var(--color-red) / <alpha-value>)',
          green: 'rgb(var(--color-green) / <alpha-value>)',
          yellow: 'rgb(var(--color-yellow) / <alpha-value>)',
          blue: 'rgb(var(--color-blue) / <alpha-value>)',
          purple: 'rgb(var(--color-purple) / <alpha-value>)',
          aqua: 'rgb(var(--color-aqua) / <alpha-value>)',
          orange: 'rgb(var(--color-orange) / <alpha-value>)',
        },
      },
      typography: {
        gruvbox: {
          css: {
            '--tw-prose-body': 'rgb(var(--color-fg2))',
            '--tw-prose-headings': 'rgb(var(--color-fg0))',
            '--tw-prose-links': 'rgb(var(--color-blue))',
            '--tw-prose-bold': 'rgb(var(--color-fg))',
            '--tw-prose-counters': 'rgb(var(--color-fg4))',
            '--tw-prose-bullets': 'rgb(var(--color-red))',
            '--tw-prose-hr': 'rgb(var(--color-bg3))',
            '--tw-prose-quotes': 'rgb(var(--color-fg3))',
            '--tw-prose-quote-borders': 'rgb(var(--color-red) / 0.4)',
            '--tw-prose-code': 'rgb(var(--color-orange))',
            '--tw-prose-pre-bg': 'rgb(var(--color-bg1))',
            '--tw-prose-pre-code': 'rgb(var(--color-fg))',
            // Headings
            'h1': {
              fontSize: '2em',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              borderBottom: '2px solid rgb(var(--color-red) / 0.3)',
              paddingBottom: '0.4em',
              marginBottom: '1em',
            },
            'h2': {
              fontSize: '1.5em',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              borderBottom: '1px solid rgb(var(--color-bg3))',
              paddingBottom: '0.3em',
              marginTop: '2em',
            },
            'h3': {
              fontSize: '1.2em',
              fontWeight: '600',
              color: 'rgb(var(--color-fg0))',
              marginTop: '1.8em',
            },
            'h4': {
              fontSize: '1em',
              fontWeight: '600',
              color: 'rgb(var(--color-yellow))',
              marginTop: '1.5em',
            },
            // Links
            'a': {
              color: 'rgb(var(--color-blue))',
              textDecoration: 'underline',
              textDecorationColor: 'rgb(var(--color-blue) / 0.3)',
              textUnderlineOffset: '3px',
              fontWeight: '500',
              transition: 'text-decoration-color 0.2s',
              '&:hover': {
                textDecorationColor: 'rgb(var(--color-blue))',
              },
            },
            // Lists
            'ul': {
              paddingLeft: '1.25em',
            },
            'li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'li::marker': {
              color: 'rgb(var(--color-red))',
            },
            // Blockquotes
            'blockquote': {
              borderLeftWidth: '3px',
              borderLeftColor: 'rgb(var(--color-red) / 0.4)',
              backgroundColor: 'rgb(var(--color-bg1))',
              borderRadius: '0 0.25rem 0.25rem 0',
              padding: '0.75em 1em',
              fontStyle: 'normal',
            },
            'blockquote p': {
              margin: '0',
            },
            // Code
            'code': {
              backgroundColor: 'rgb(var(--color-bg1))',
              padding: '0.2em 0.4em',
              borderRadius: '0.125rem',
              fontSize: '0.85em',
              fontWeight: '500',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            // Pre (code blocks)
            'pre': {
              borderRadius: '0.25rem',
              border: '1px solid rgb(var(--color-bg2))',
              padding: '1em 1.25em',
            },
            // Images
            'img': {
              borderRadius: '0.25rem',
              border: '1px solid rgb(var(--color-bg2))',
            },
            // Strong / emphasis
            'strong': {
              color: 'rgb(var(--color-fg0))',
              fontWeight: '600',
            },
            'em': {
              color: 'rgb(var(--color-fg3))',
            },
            // Horizontal rule
            'hr': {
              borderColor: 'rgb(var(--color-bg3))',
              marginTop: '2em',
              marginBottom: '2em',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
