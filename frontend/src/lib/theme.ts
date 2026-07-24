import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/**
 * Minuit theme — late-show console.
 *
 * OLED-black surfaces lit by a single electric cobalt accent.
 * The neon cinema sign at midnight: deepest black, one vivid blue,
 * crisp near-white type. Extends neutralTheme; overrides the
 * surface hierarchy, accent, and text ladder.
 */
export const minuitTheme = defineTheme({
  name: 'minuit',
  extends: neutralTheme,
  color: { accent: '#3D8BFF' },
  tokens: {
    // Accent: electric cobalt blue (light, dark)
    '--color-accent': ['#1E5FD9', '#3D8BFF'],
    '--color-accent-muted': ['#3D8BFF33', '#3D8BFF22'],
    '--color-text-accent': ['#1A4FA8', '#5BA0FF'],
    '--color-icon-accent': ['#1E5FD9', '#3D8BFF'],
    // OLED-black surface hierarchy (deepest -> slightly raised)
    '--color-background-body': ['#f3f4f6', '#050506'],
    '--color-background-surface': ['#ffffff', '#0a0a0c'],
    '--color-background-card': ['#ffffff', '#0f0f12'],
    '--color-background-popover': ['#ffffff', '#151519'],
    '--color-background-muted': ['#0536590c', '#ffffff08'],
    // Text: crisp near-white primary, ash-grey secondary
    '--color-text-primary': ['#0a0a0c', '#f4f4f6'],
    '--color-text-secondary': ['#4a4a52', '#8c8c96'],
    // Borders: ghost hairlines on black
    '--color-border': ['#05365919', '#ffffff0a'],
    '--color-border-emphasized': ['#ccd3db', '#ffffff1f'],
  },
});