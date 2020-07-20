import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('guilds', function (table) {
    table.string('notificationChannel').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('guilds', function (table) {
    table.dropColumn('notificationChannel')
  })
}
