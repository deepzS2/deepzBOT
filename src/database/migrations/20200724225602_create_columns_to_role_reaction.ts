import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('guilds', function (table) {
    table.string('roleMessage').nullable()
    table.string('channelRoleMessage').nullable()
    table.specificType('roles', 'jsonb ARRAY').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('guilds', function (table) {
    table.dropColumn('roleMessage')
    table.dropColumn('channelRoleMessage')
    table.dropColumn('roles')
  })
}
