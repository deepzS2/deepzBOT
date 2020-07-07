import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', function (table) {
    table.string('id').primary().notNullable()
    table.string('username').notNullable()
    table.string('background_image').nullable()
    table.string('bio').nullable()
    table.integer('reputation').defaultTo(0)
    table.float('balance').defaultTo(0)
    table.float('xp').defaultTo(0)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
