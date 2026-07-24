import env from '#start/env'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Theater from '#models/theater'
import Schedule from '#models/schedule'
import type { FilmEntry, SchedulePayload } from '#models/schedule'
import AllocineService from '#services/allocine_service'

export type TheaterSlice = {
  slug: string
  name: string
  lastFetchedAt: string
  films: SchedulePayload['films']
}

export type DaySchedules = {
  date: string
  dayOffset: number
  displayDate: string
  generatedAt: string
  theaters: TheaterSlice[]
}

export type SchedulesResponse = DaySchedules & {}

export type SchedulesRangeResponse = {
  days: DaySchedules[]
}

function ttlMinutes(): number {
  return env.get('CACHE_TTL_MINUTES')
}

function isStale(lastFetchedAt: DateTime, now: DateTime): boolean {
  return now.diff(lastFetchedAt, 'minutes').minutes > ttlMinutes()
}

function rewritePosterUrls(films: FilmEntry[]): FilmEntry[] {
  return films.map((film) => ({
    ...film,
    // Tolerate rows cached before the posterUrl field existed — `film.posterUrl`
    // is `undefined` rather than `null` in that case.
    posterUrl: film.posterUrl ? `/api/v1/poster?url=${encodeURIComponent(film.posterUrl)}` : null,
  }))
}

function normalizeFilms(films: unknown): FilmEntry[] {
  // Defensive: when a cached payload predates a schema field, fill in
  // nulls instead of leaving `undefined` (which becomes a missing key in
  // the JSON response and breaks clients that expect the field).
  if (!Array.isArray(films)) return []
  return films.map((raw) => {
    const f = raw as Partial<FilmEntry>
    return {
      title: f.title ?? 'FILM INCONNU',
      runtime: typeof f.runtime === 'number' ? f.runtime : 0,
      posterUrl: f.posterUrl ?? null,
      showtimes: Array.isArray(f.showtimes) ? f.showtimes : [],
    }
  })
}

export function parseDaysParam(days: string | number | undefined): number[] {
  if (days === undefined) return [0]
  if (typeof days === 'number') return [days]

  const [from, to] = days.split('-').map((n) => Number.parseInt(n, 10))
  const offsets: number[] = []
  for (let i = from; i <= to; i++) offsets.push(i)
  return offsets
}

export default class ScheduleService {
  async getSchedules(
    dayOffsets: number[],
    options: { fresh?: boolean } = {}
  ): Promise<SchedulesResponse | SchedulesRangeResponse> {
    if (dayOffsets.length === 1) {
      return this.getSchedulesForDay(dayOffsets[0]!, options)
    }
    return this.getSchedulesRange(dayOffsets, options)
  }

  async getSchedulesForDay(
    dayOffset: number,
    options: { fresh?: boolean } = {}
  ): Promise<SchedulesResponse> {
    const now = DateTime.now()
    const day = await this.resolveDay(dayOffset, now, options)
    return day
  }

  async getSchedulesRange(
    dayOffsets: number[],
    options: { fresh?: boolean } = {}
  ): Promise<SchedulesRangeResponse> {
    const now = DateTime.now()
    const days = await Promise.all(
      dayOffsets.map((offset) => this.resolveDay(offset, now, options))
    )
    return { days }
  }

  private async resolveDay(
    dayOffset: number,
    now: DateTime,
    options: { fresh?: boolean } = {}
  ): Promise<DaySchedules> {
    const target = now.plus({ days: dayOffset })
    const formattedDate = target.toISODate()!
    const displayDate = target.setLocale('fr-FR').toLocaleString({
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    const theaters = await Theater.query().where('is_active', true).orderBy('id', 'asc')

    const slices = await Promise.all(
      theaters.map((theater) =>
        this.resolveSlice(theater, formattedDate, target.toISO()!, now, options)
      )
    )

    return {
      date: formattedDate,
      dayOffset,
      displayDate,
      generatedAt: now.toISO()!,
      theaters: slices,
    }
  }

  private async resolveSlice(
    theater: Theater,
    formattedDate: string,
    targetIso: string,
    now: DateTime,
    options: { fresh?: boolean } = {}
  ): Promise<TheaterSlice> {
    const existing = await Schedule.query()
      .where('theater_id', theater.id)
      .where('date', formattedDate)
      .first()

    if (existing && !options.fresh && !isStale(existing.lastFetchedAt, now)) {
      return {
        slug: theater.slug,
        name: theater.name,
        lastFetchedAt: existing.lastFetchedAt.toISO()!,
        films: rewritePosterUrls(normalizeFilms(existing.payload.films)),
      }
    }

    const allocine = new AllocineService()
    const payload = await allocine.fetchSchedule(theater, formattedDate, targetIso)

    await this.upsertCache(theater.id, formattedDate, payload, now)

    return {
      slug: theater.slug,
      name: theater.name,
      lastFetchedAt: now.toISO()!,
      films: rewritePosterUrls(payload.films),
    }
  }

  private async upsertCache(
    theaterId: number,
    formattedDate: string,
    payload: SchedulePayload,
    now: DateTime
  ): Promise<void> {
    await db.transaction(async (trx) => {
      const existing = await Schedule.query({ client: trx })
        .where('theater_id', theaterId)
        .where('date', formattedDate)
        .first()

      if (existing) {
        existing.payload = payload
        existing.lastFetchedAt = now
        await existing.save()
        return
      }

      await Schedule.create(
        {
          theaterId,
          date: DateTime.fromISO(formattedDate),
          payload,
          lastFetchedAt: now,
        },
        { client: trx }
      )
    })
  }
}
