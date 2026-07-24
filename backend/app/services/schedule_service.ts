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
    posterUrl: film.posterUrl ? `/api/v1/poster?url=${encodeURIComponent(film.posterUrl)}` : null,
  }))
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
  async getSchedules(dayOffsets: number[]): Promise<SchedulesResponse | SchedulesRangeResponse> {
    if (dayOffsets.length === 1) {
      return this.getSchedulesForDay(dayOffsets[0]!)
    }
    return this.getSchedulesRange(dayOffsets)
  }

  async getSchedulesForDay(dayOffset: number): Promise<SchedulesResponse> {
    const now = DateTime.now()
    const day = await this.resolveDay(dayOffset, now)
    return day
  }

  async getSchedulesRange(dayOffsets: number[]): Promise<SchedulesRangeResponse> {
    const now = DateTime.now()
    const days = await Promise.all(dayOffsets.map((offset) => this.resolveDay(offset, now)))
    return { days }
  }

  private async resolveDay(dayOffset: number, now: DateTime): Promise<DaySchedules> {
    const target = now.plus({ days: dayOffset })
    const formattedDate = target.toISODate()!
    const displayDate = target.setLocale('fr-FR').toLocaleString({
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    const theaters = await Theater.query().where('is_active', true).orderBy('id', 'asc')

    const slices = await Promise.all(
      theaters.map((theater) => this.resolveSlice(theater, formattedDate, target.toISO()!, now))
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
    now: DateTime
  ): Promise<TheaterSlice> {
    const existing = await Schedule.query()
      .where('theater_id', theater.id)
      .where('date', formattedDate)
      .first()

    if (existing && !isStale(existing.lastFetchedAt, now)) {
      return {
        slug: theater.slug,
        name: theater.name,
        lastFetchedAt: existing.lastFetchedAt.toISO()!,
        films: rewritePosterUrls(existing.payload.films),
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
