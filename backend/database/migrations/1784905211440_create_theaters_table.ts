import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'theaters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('allocine_id', 16).notNullable().unique()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
