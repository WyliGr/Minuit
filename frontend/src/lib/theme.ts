import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/**
 * Minuit theme — cinematic dark with warm amber accent.
 *
 * The cinema at midnight: deep black surfaces, warm gold accent
 * (#F5C518) like projector light cutting through darkness.
 * Extends neutralTheme; overrides only what the aesthetic needs.
 */
export const minuitTheme = defineTheme({
  name: 'minuit',
  extends: neutralTheme,
  color: { accent: '#F5C518' },
  tokens: {
    // Accent: warm cinema gold (light, dark)
    '--color-accent': ['#E6B400', '#F5C518'],
    '--color-accent-muted': ['#F5C51833', '#F5C51826'],
    '--color-text-accent': ['#996B00', '#F5C518'],
    '--color-icon-accent': ['#E6B400', '#F5C518'],
    // Deep black surface hierarchy
    '--color-background-body': ['#f1f4f7', '#0a0a0b'],
    '--color-background-surface': ['#ffffff', '#131316'],
    '--color-background-card': ['#ffffff', '#18181c'],
    '--color-background-popover': ['#ffffff', '#1e1e24'],
    '--color-background-muted': ['#0536590c', '#0a0a0b80'],
    // Text: near-white primary, soft grey secondary
    '--color-text-primary': ['#0a1317', '#f0f0f2'],
    '--color-text-secondary': ['#4e606f', '#8a8a93'],
    // Borders: very subtle on black
    '--color-border': ['#05365919', '#ffffff0a'],
    '--color-border-emphasized': ['#ccd3db', '#ffffff1a'],
  },
});