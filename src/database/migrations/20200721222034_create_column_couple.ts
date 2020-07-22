import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('users', function (table) {
    table.string('couple').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('users', function (table) {
    table.dropColumn('couple')
  })
}
