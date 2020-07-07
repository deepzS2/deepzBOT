import knex from 'knex'

const { development, production } = require('../knexfile')

const db =
  process.env.NODE_ENV === 'prod' ? knex(production) : knex(development)

export default db
