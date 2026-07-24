import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('theater_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('theaters')
        .onDelete('CASCADE')

      table.date('date').notNullable()
      table.json('payload').notNullable()
      table.timestamp('last_fetched_at').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['theater_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
