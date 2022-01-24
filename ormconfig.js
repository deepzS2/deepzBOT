const rootDir = process.env.NODE_ENV === 'development' ? 'src' : 'dist'

module.exports = {
  entities: [rootDir + '/database/entities/**/*.{js,ts}'],
  migrations: [rootDir + '/database/migrations/**/*.{js,ts}'],
  subscribers: [rootDir + '/database/subscribers/**/*.{js,ts}'],
  cli: {
    entitiesDir: rootDir + '/database/entities',
    migrationsDir: rootDir + '/database/migrations',
    subscribersDir: rootDir + '/database/subscribers',
  },
}
