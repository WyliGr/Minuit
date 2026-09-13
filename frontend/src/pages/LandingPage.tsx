import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CalendarBlank,
  Clock,
  FilmReel,
  Lightning,
  MoonStars,
  Sparkle,
  Television,
} from '@phosphor-icons/react'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  )
}

const features = [
  {
    icon: Lightning,
    title: 'Direct des salles',
    body: 'Les horaires sont récupérés en direct sur Allociné puis mis en cache 6 heures — assez frais pour décider, assez léger pour être instantané.',
  },
  {
    icon: CalendarBlank,
    title: 'Sept jours, un coup d’œil',
    body: 'Aujourd’hui, demain, ou la semaine entière. Les séances déjà commencées disparaissent, il ne reste que l’utile.',
  },
  {
    icon: Television,
    title: 'Formats premium détectés',
    body: 'IMAX, 4DX, Dolby Atmos — chaque séance est étiquetée avec son format pour choisir l’expérience, pas juste l’horaire.',
  },
]

const theaters = [
  'UGC Ciné Cité',
  'Le Cosmos',
  'Vox',
  'Star',
  'Star St-Exupéry',
  'Pathé Brumath',
]

export function LandingPage() {
  const reduce = useReducedMotion()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* projector beam */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[140%] w-[min(900px,90vw)] -translate-x-1/2 rotate-12 bg-[radial-gradient(ellipse_at_top,rgba(101,98,219,0.09),transparent_60%)]"
        />
        <div className="relative mx-auto flex min-h-[92dvh] max-w-6xl flex-col justify-center px-4 pb-20 pt-24 sm:px-6">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-glow-500"
          >
            Strasbourg · 6 salles · 7 jours
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOutExpo }}
            className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl"
          >
            Toutes les séances de cinéma de Strasbourg,{' '}
            <span className="text-glow-500">en un coup d’œil.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: easeOutExpo }}
            className="mt-6 max-w-[65ch] text-lg leading-relaxed text-ink-300"
          >
            Minuit rassemble les horaires de toutes les salles de la ville :
            choisissez un jour, trouvez votre film, partez à temps.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: easeOutExpo }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/dashboard"
              className="group flex items-center gap-2.5 rounded-full bg-glow-500 px-7 py-3.5 text-base font-semibold text-ink-950 transition-all duration-200 hover:bg-glow-600 active:scale-[0.98]"
            >
              Voir les séances
              <ArrowRight
                weight="bold"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <a
              href="#comment"
              className="rounded-full border border-ink-700 px-7 py-3.5 text-base font-medium text-ink-200 transition-colors duration-200 hover:border-ink-600 hover:bg-ink-900 active:scale-[0.98]"
            >
              Comment ça marche
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Theater marquee ───────────────────────────────── */}
      <section className="border-y border-ink-800 bg-ink-900/50 py-5">
        <div className="relative overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap px-4">
            {[...theaters, ...theaters].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="flex items-center gap-10 text-sm font-medium tracking-wide text-ink-400"
              >
                {name}
                <FilmReel weight="fill" className="size-4 text-ink-700" />
              </span>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent"
          />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="comment" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
            Une seule question : <span className="text-ink-400">« on va où, à quelle heure ? »</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-800 bg-ink-800 md:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col gap-4 bg-ink-900 p-8 transition-colors duration-300 hover:bg-ink-850">
                <feature.icon weight="duotone" className="size-8 text-glow-500" />
                <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-300">{feature.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Numbers strip ─────────────────────────────────── */}
      <section className="border-y border-ink-800 bg-ink-900/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-ink-800 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          {[
            { value: '6', label: 'salles couvertes, de la Neudorf à Brumath' },
            { value: '7', label: 'jours de séances disponibles d’avance' },
            { value: '6 h', label: 'de cache — frais sans être lent' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="flex flex-col gap-2 px-2 py-10 text-center sm:py-12">
                <span className="font-mono text-4xl font-bold text-glow-500">{stat.value}</span>
                <span className="text-sm text-ink-300">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── API section ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
              Pensé aussi pour les machines
            </h2>
            <p className="mt-5 max-w-[65ch] leading-relaxed text-ink-300">
              Derrière cette interface, Minuit est une API publique : trois endpoints,
              du JSON propre, une spec OpenAPI. Branchez un agent, un widget, une app —
              pas de clé, pas d’inscription.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['GET /theaters', 'GET /theater?days=0-6', 'GET /poster'].map((endpoint) => (
                <code
                  key={endpoint}
                  className="rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2 font-mono text-xs text-ink-200"
                >
                  {endpoint}
                </code>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
              <div className="flex items-center gap-2 border-b border-ink-700 px-5 py-3.5">
                <span className="size-2.5 rounded-full bg-ink-700" />
                <span className="size-2.5 rounded-full bg-ink-700" />
                <span className="size-2.5 rounded-full bg-glow-500/60" />
                <span className="ml-3 font-mono text-xs text-ink-400">minuit — api</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-ink-200">
{`{
  "date": "2026-07-24",
  "displayDate": "vendredi 24 juillet",
  "theaters": [
    {
      "slug": "ugc-cine-cite",
      "films": [
        {
          "title": "DUNE PART TWO",
          "runtime": 166,
          "showtimes": [
            { "time": "14:30", "format": "IMAX" }
          ]
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-ink-800">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[min(700px,90vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(101,98,219,0.1),transparent_65%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-28 text-center sm:px-6 lg:py-36">
          <Reveal>
            <MoonStars weight="duotone" className="size-12 text-glow-500" />
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="max-w-2xl text-4xl font-bold tracking-tighter text-balance sm:text-5xl">
              La séance commence bientôt
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <Link
              to="/dashboard"
              className="group flex items-center gap-2.5 rounded-full bg-glow-500 px-8 py-4 text-base font-semibold text-ink-950 transition-all duration-200 hover:bg-glow-600 active:scale-[0.98]"
            >
              Ouvrir le tableau des séances
              <Sparkle weight="fill" className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="flex items-center gap-2 font-mono text-xs text-ink-400">
              <Clock weight="bold" className="size-3.5" />
              les séances passées d’aujourd’hui sont masquées automatiquement
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}