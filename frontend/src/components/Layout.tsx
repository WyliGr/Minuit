import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { MoonStars, Popcorn } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/dashboard', label: 'Séances' },
]

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="grain flex min-h-[100dvh] flex-col bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="group flex items-center gap-2.5">
            <MoonStars
              weight="fill"
              className="size-6 text-glow-500 transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="text-lg font-semibold tracking-tight">Minuit</span>
          </NavLink>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4',
                    isActive
                      ? 'bg-ink-800 text-ink-100'
                      : 'text-ink-300 hover:bg-ink-850 hover:text-ink-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="/dashboard"
              className="ml-1 hidden items-center gap-2 rounded-full bg-glow-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition-all duration-200 hover:bg-glow-600 active:scale-[0.98] sm:flex"
            >
              <Popcorn weight="fill" className="size-4" />
              Voir les séances
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink-400 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <MoonStars weight="fill" className="size-4 text-glow-500" />
            Minuit — données Allociné, mises en cache 6 h
          </p>
          <p className="font-mono text-xs">{new Date().getFullYear()} · Strasbourg</p>
          <p className="text-sm text-ink-300">
            Fait avec{' '}
            <a
              href="https://wyliam.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-glow-400 underline-offset-4 transition-colors hover:text-glow-500 hover:underline"
            >
              &lt;3 par Wyliam
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}