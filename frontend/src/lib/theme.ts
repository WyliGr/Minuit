import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/**
 * Minuit theme — neutral base, dark-only, with #0f0f10 body background.
 *
 * Per Astryx rules: brand/accent via `defineTheme`, never override
 * --color-* in :root. We extend neutralTheme and override only the
 * surface tokens needed for the strict #0f0f10 dark aesthetic.
 *
 * Color token overrides use [light, dark] arrays. Since this app is
 * dark-only (we set <Theme mode="dark">), the dark value is what ships.
 */
export const minuitTheme = defineTheme({
  name: 'minuit',
  extends: neutralTheme,
  tokens: {
    // Primary application background — the spec's exact #0f0f10.
    '--color-background-body': ['#f1f4f7', '#0f0f10'],
    // Surface sits one step above body. Lift slightly off #0f0f10.
    '--color-background-surface': ['#ffffff', '#161617'],
    // Card sits above surface.
    '--color-background-card': ['#ffffff', '#1b1b1d'],
    // Popover (menus, dropdowns) above card.
    '--color-background-popover': ['#ffffff', '#222224'],
    // Muted background for toolbar strips and hover washes.
    '--color-background-muted': ['#0536590c', '#0f0f1080'],
  },
});