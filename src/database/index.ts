import knex from 'knex'

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

export default db
