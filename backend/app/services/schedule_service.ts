import env from '#start/env'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Theater from '#models/theater'
import Schedule from '#models/schedule'
import type { SchedulePayload } from '#models/schedule'
import AllocineService from '#services/allocine_service'

export type TheaterSlice = {
  slug: string
  name: string
  films: SchedulePayload['films']
}

export type SchedulesResponse = {
  date: string
  dayOffset: number
  displayDate: string
  generatedAt: string
  theaters: TheaterSlice[]
}

function ttlMinutes(): number {
  return env.get('CACHE_TTL_MINUTES')
}

function isStale(lastFetchedAt: DateTime, now: DateTime): boolean {
  return now.diff(lastFetchedAt, 'minutes').minutes > ttlMinutes()
}

export default class ScheduleService {
  async getSchedules(dayOffset: number): Promise<SchedulesResponse> {
    const now = DateTime.now()
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
      return { slug: theater.slug, name: theater.name, films: existing.payload.films }
    }

    const allocine = new AllocineService()
    const payload = await allocine.fetchSchedule(theater, formattedDate, targetIso)

    await this.upsertCache(theater.id, formattedDate, payload, now)

    return { slug: theater.slug, name: theater.name, films: payload.films }
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
