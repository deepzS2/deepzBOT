import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('guilds', (table) => {
    table.string('id').primary()
    table.specificType('twitchs', 'text ARRAY').nullable()
    table.string('name').notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('guilds')
}
