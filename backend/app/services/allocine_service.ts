import type Theater from '#models/theater'
import { DateTime } from 'luxon'
import { allocinePayloadValidator } from '#validators/allocine_payload'
import type { FilmEntry, SchedulePayload, ShowtimeEntry } from '#models/schedule'
import { resolveTargetDate } from '#services/schedule_service'

const ALLOCINE_BASE = 'https://www.allocine.fr/_/showtimes/theater-'

function parseRuntime(raw: string | undefined): number {
  if (!raw) return 0
  const hours = /(\d+)\s*h/.exec(raw)
  const minutes = /(\d+)\s*min/.exec(raw)
  const h = hours ? Number.parseInt(hours[1], 10) : 0
  const m = minutes ? Number.parseInt(minutes[1], 10) : 0
  return h * 60 + m
}

const FORMAT_PATTERNS: { tags: string[]; experience: string[]; label: string }[] = [
  { tags: ['Format.Projection.Imax'], experience: [], label: 'IMAX' },
  { tags: ['Auditorium.Experience.4dx'], experience: ['E_4DX'], label: '4DX' },
  { tags: ['Auditorium.Experience.DolbyAtmos'], experience: ['DOLBY_ATMOS'], label: 'Dolby Atmos' },
  { tags: ['Auditorium.Experience.PLF'], experience: ['PLF'], label: 'PLF' },
]

function detectFormat(tags: string[] | undefined, experience: string[] | undefined): string | null {
  for (const pattern of FORMAT_PATTERNS) {
    if (tags?.some((t) => pattern.tags.includes(t))) return pattern.label
    if (experience?.some((e) => pattern.experience.includes(e))) return pattern.label
  }
  return null
}

export default class AllocineService {
  private async fetchRaw(theater: Theater, formattedDate: string): Promise<unknown> {
    const url = `${ALLOCINE_BASE}${theater.allocineId}/d-${formattedDate}`

    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    })

    if (!res.ok) {
      throw new Error(`Allocine fetch failed (${res.status}) for ${theater.slug}@${formattedDate}`)
    }

    return res.json()
  }

  async fetchSchedule(
    theater: Theater,
    formattedDate: string,
    targetIso: string
  ): Promise<SchedulePayload> {
    const raw = await this.fetchRaw(theater, formattedDate)
    const cleaned = await allocinePayloadValidator.validate(raw)

    const targetDate = resolveTargetDate(targetIso)
    const now = DateTime.now().setZone(targetDate.zone)
    const isToday = targetDate.hasSame(now, 'day')

    const films: FilmEntry[] = []

    for (const item of cleaned.results) {
      const st = item.showtimes
      if (!st) continue

      const showtimes: ShowtimeEntry[] = []

      for (const key of Object.keys(st)) {
        const list = st[key]
        if (!Array.isArray(list)) continue

        for (const s of list) {
          // startsAt is a local ISO string without a timezone — parse it in the
          // schedules timezone so the past-showtime filter compares real instants.
          const date = DateTime.fromISO(s.startsAt, { zone: targetDate.zone })
          if (isToday && date < now) continue

          const time = date.toFormat('HH:mm')

          showtimes.push({
            time,
            startsAt: s.startsAt,
            isVost: s.diffusionVersion === 'ORIGINAL',
            isPreview: !!s.isPreview,
            format: detectFormat(s.tags, s.experience),
          })
        }
      }

      if (showtimes.length === 0) continue

      showtimes.sort((a, b) => a.startsAt.localeCompare(b.startsAt))

      const rawTitle = item.movie?.title ?? ''
      const title = rawTitle.toUpperCase().replace(/["«»]/g, '').trim() || 'FILM INCONNU'

      films.push({
        title,
        runtime: parseRuntime(item.movie?.runtime),
        posterUrl: item.movie?.poster?.url ?? null,
        showtimes,
      })
    }

    return { films }
  }
}
