import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowsClockwise,
  CalendarBlank,
  Clock,
  FilmSlate,
  Path,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  ApiError,
  fetchDaySchedules,
  fetchTheaters,
  type DaySchedules,
  type TheaterListItem,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const DAY_COUNT = 7
const easeOutExpo = [0.16, 1, 0.3, 1] as const

function formatDayLabel(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date
    .toLocaleDateString('fr-FR', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase()
}

function formatDayNumber(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return String(date.getDate()).padStart(2, '0')
}

function formatRuntime(runtime: number): string {
  if (runtime <= 0) return '—'
  const h = Math.floor(runtime / 60)
  const m = runtime % 60
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

function freshnessLabel(lastFetchedAt: string): string {
  const diffMin = Math.max(
    0,
    Math.round((Date.now() - new Date(lastFetchedAt).getTime()) / 60000)
  )
  if (diffMin < 1) return 'à l\u2019instant'
  if (diffMin < 60) return `il y a ${diffMin} min`
  const hours = Math.floor(diffMin / 60)
  return hours === 1 ? 'il y a 1 h' : `il y a ${hours} h`
}

function FilmSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-ink-800 p-4 sm:gap-5 sm:p-5">
      <div className="skeleton aspect-[2/3] w-20 shrink-0 rounded-lg sm:w-24" />
      <div className="flex grow flex-col gap-3 py-1">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-7 w-14 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

function TheaterSkeleton() {
  return (
    <section className="space-y-4">
      <div className="skeleton h-7 w-48 rounded" />
      <FilmSkeleton />
      <FilmSkeleton />
      <FilmSkeleton />
    </section>
  )
}

export function DashboardPage() {
  const [dayOffset, setDayOffset] = useState(0)
  const [data, setData] = useState<DaySchedules | null>(null)
  const [theaterList, setTheaterList] = useState<TheaterListItem[]>([])
  const [activeTheaters, setActiveTheaters] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    fetchTheaters()
      .then((res) => {
        setTheaterList(res.theaters)
        setActiveTheaters(new Set(res.theaters.map((t) => t.slug)))
      })
      .catch(() => {
        /* theater filter falls back to schedule data below */
      })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchDaySchedules(dayOffset)
      .then((res) => {
        if (cancelled) return
        setData(res)
        if (theaterList.length === 0) {
          setActiveTheaters(new Set(res.theaters.map((t) => t.slug)))
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? `L\u2019API a répondu avec une erreur (${err.status}).`
            : 'Impossible de joindre l\u2019API. Vérifiez que le backend est lancé.'
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOffset])

  const theaters = useMemo(() => {
    if (!data) return []
    return data.theaters.filter((t) => activeTheaters.has(t.slug))
  }, [data, activeTheaters])

  const totalFilms = theaters.reduce((acc, t) => acc + t.films.length, 0)

  const toggleTheater = (slug: string) => {
    setActiveTheaters((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tighter sm:text-4xl">
            <FilmSlate weight="duotone" className="size-8 text-amber-glow" />
            Séances
          </h1>
          {!loading && data && (
            <p className="mt-2 text-sm text-ink-300">
              {data.displayDate} ·{' '}
              <span className="font-mono text-ink-400">
                {theaters.length} salle{theaters.length > 1 ? 's' : ''} · {totalFilms} film
                {totalFilms > 1 ? 's' : ''}
              </span>
            </p>
          )}
        </div>
        {data && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-ink-400">
            <ArrowsClockwise weight="bold" className="size-3.5" />
            maj {freshnessLabel(data.theaters[0]?.lastFetchedAt ?? data.generatedAt)}
          </p>
        )}
      </div>

      {/* ── Day picker ─────────────────────────────────── */}
      <div className="rail-scroll mt-8 flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: DAY_COUNT }, (_, i) => i).map((offset) => (
          <button
            key={offset}
            onClick={() => setDayOffset(offset)}
            className={cn(
              'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 transition-all duration-200 active:scale-[0.97]',
              offset === dayOffset
                ? 'border-amber-glow bg-amber-glow/10 text-amber-glow'
                : 'border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600 hover:text-ink-100'
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              {offset === 0 ? 'Auj.' : formatDayLabel(offset)}
            </span>
            <span className="text-lg font-semibold leading-none">
              {formatDayNumber(offset)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Theater filter ─────────────────────────────── */}
      {theaterList.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {theaterList.map((theater) => {
            const active = activeTheaters.has(theater.slug)
            return (
              <button
                key={theater.slug}
                onClick={() => toggleTheater(theater.slug)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]',
                  active
                    ? 'border-ink-600 bg-ink-800 text-ink-100'
                    : 'border-ink-800 bg-transparent text-ink-400 hover:border-ink-600 hover:text-ink-300'
                )}
              >
                {theater.name}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Content ────────────────────────────────────── */}
      <div className="mt-12 space-y-16">
        {error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 px-6 py-16 text-center">
            <WarningCircle weight="duotone" className="size-10 text-amber-glow" />
            <p className="max-w-md text-ink-200">{error}</p>
            <button
              onClick={() => setDayOffset((d) => d)}
              className="rounded-full border border-ink-600 px-5 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 active:scale-[0.98]"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading && (
          <>
            <TheaterSkeleton />
            <TheaterSkeleton />
          </>
        )}

        {!loading && !error && theaters.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-800 px-6 py-16 text-center">
            <CalendarBlank weight="duotone" className="size-10 text-ink-400" />
            <p className="text-ink-300">Aucune salle sélectionnée.</p>
            <button
              onClick={() =>
                setActiveTheaters(new Set((data?.theaters ?? []).map((t) => t.slug)))
              }
              className="text-sm font-medium text-amber-glow underline-offset-4 hover:underline"
            >
              Tout réactiver
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          theaters.map((theater, theaterIdx) => (
            <motion.section
              key={theater.slug}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: Math.min(theaterIdx * 0.05, 0.25),
                ease: easeOutExpo,
              }}
              className="space-y-5"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {theater.name}
                </h2>
                <span className="font-mono text-xs text-ink-400">
                  {theater.films.length === 0
                    ? 'aucune séance'
                    : `${theater.films.length} film${theater.films.length > 1 ? 's' : ''}`}
                </span>
              </header>

              {theater.films.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-700 px-5 py-8 text-center text-sm text-ink-400">
                  Pas de séance ce jour dans cette salle.
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {theater.films.map((film) => (
                    <article
                      key={`${theater.slug}-${film.title}`}
                      className="group flex gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-4 transition-colors duration-300 hover:border-ink-600 sm:gap-5 sm:p-5"
                    >
                      {film.posterUrl ? (
                        <img
                          src={film.posterUrl}
                          alt=""
                          loading="lazy"
                          className="aspect-[2/3] w-20 shrink-0 rounded-lg object-cover sm:w-24"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-20 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 sm:w-24">
                          <FilmSlate weight="duotone" className="size-7 text-ink-600" />
                        </div>
                      )}

                      <div className="flex min-w-0 grow flex-col gap-2">
                        <h3 className="text-lg font-semibold leading-snug tracking-tight text-balance">
                          {film.title}
                        </h3>
                        <p className="flex items-center gap-1.5 font-mono text-xs text-ink-400">
                          <Clock weight="bold" className="size-3" />
                          {formatRuntime(film.runtime)}
                        </p>

                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                          {film.showtimes.map((showtime) => (
                            <span
                              key={`${theater.slug}-${film.title}-${showtime.startsAt}`}
                              title={[
                                showtime.format,
                                showtime.isVost ? 'VO' : undefined,
                                showtime.isPreview ? 'avant-première' : undefined,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                              className={cn(
                                'rounded-full px-3 py-1.5 font-mono text-xs font-medium transition-colors',
                                showtime.format
                                  ? 'bg-amber-glow/15 text-amber-glow'
                                  : 'bg-ink-800 text-ink-200'
                              )}
                            >
                              {showtime.time}
                              {showtime.isVost && (
                                <span className="ml-1.5 opacity-70">VO</span>
                              )}
                              {showtime.isPreview && (
                                <span className="ml-1.5 opacity-70">AV.P</span>
                              )}
                              {showtime.format && (
                                <span className="ml-1.5 font-semibold">
                                  {showtime.format}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.section>
          ))}

        {!loading && !error && theaters.length > 0 && totalFilms === 0 && (
          <p className="py-8 text-center text-sm text-ink-400">
            Toutes les salles sélectionnées sont vides ce jour-là.{' '}
            <Link to="/" className="text-amber-glow underline-offset-4 hover:underline">
              Retour à l\u2019accueil
            </Link>
          </p>
        )}
      </div>

      {/* legend */}
      {!loading && !error && totalFilms > 0 && (
        <p className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-800 pt-6 font-mono text-[11px] text-ink-400">
          <span className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-amber-glow" /> format premium
            (IMAX, 4DX, Dolby Atmos…)
          </span>
          <span className="flex items-center gap-2">
            <Path weight="bold" className="size-3" /> VO = version originale
          </span>
        </p>
      )}
    </div>
  )
}