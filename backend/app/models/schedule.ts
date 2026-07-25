import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Theater from '#models/theater'

export type ShowtimeEntry = {
  time: string
  startsAt: string
  isVost: boolean
  isPreview: boolean
  format: string | null
}

export type FilmEntry = {
  title: string
  runtime: number
  posterUrl: string | null
  showtimes: ShowtimeEntry[]
}

export type SchedulePayload = {
  films: FilmEntry[]
}

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare theaterId: number

  @column.date()
  declare date: DateTime

  @column({
    prepare: (value: SchedulePayload) => JSON.stringify(value),
    consume: (value: string | SchedulePayload): SchedulePayload =>
      typeof value === 'string' ? (JSON.parse(value) as SchedulePayload) : value,
  })
  declare payload: SchedulePayload

  @column.dateTime()
  declare lastFetchedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Theater)
  declare theater: BelongsTo<typeof Theater>
}
