// Update with your config settings.
import { config } from 'dotenv'
config()

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DEVELOPMENT_DATABASE,
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.PRODUCTION_DATABASE,
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
}
