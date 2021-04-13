// Update with your config settings.
import { config } from 'dotenv'
config()

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DEVELOPMENT_DATABASE,
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.PRODUCTION_DATABASE,
    migrations: {
      directory: './dist/database/migrations',
    },
    seeds: {
      directory: './dist/database/seeds',
    },
  },
}
