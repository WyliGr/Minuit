import { Theme } from '@astryxdesign/core/theme';
import { minuitTheme } from '../lib/theme';

/**
 * Wraps the dashboard in the Minuit Astryx theme (dark-only, #0f0f10 body).
 * All dashboard content lives inside this provider so tokens resolve.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={minuitTheme} mode="dark">
      {children}
    </Theme>
  );
}