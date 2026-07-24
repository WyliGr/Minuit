import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Schedule from '#models/schedule'

export default class Theater extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare allocineId: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Schedule)
  declare schedules: HasMany<typeof Schedule>
}
