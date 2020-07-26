/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
import knex from 'knex'

import { Guild, User } from '@customTypes/database'

const { development, production } = require('./knexfile')

const db =
  process.env.NODE_ENV === 'prod' ? knex(production) : knex(development)

db.migrate
  .latest()
  .then((res) => {
    console.log(
      `Number of migrations: ${res[0]}\nMigrations runned: ${res[1].join('')}`
    )
  })
  .catch((err) => {
    console.error(err)
  })

export const Users = () => db<User>('users')

export const Guilds = () => db<Guild>('guilds')
