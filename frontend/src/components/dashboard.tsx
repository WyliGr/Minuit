import { ThemeProvider } from './theme-provider';

/**
 * Minuit dashboard — stub for milestone 1.
 * Verifies: Astro + React island + Astryx <Theme> + #0f0f10 theme +
 * build pipeline. Real UI lands in milestone 2.
 */
export default function Dashboard() {
  return (
    <ThemeProvider>
      <div
        style={{
          padding: '2rem',
          fontFamily: 'var(--font-family-body)',
          color: 'var(--color-text-primary)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
          Minuit
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Dashboard scaffold — Astryx theme wired, #0f0f10 background active.
        </p>
      </div>
    </ThemeProvider>
  );
}