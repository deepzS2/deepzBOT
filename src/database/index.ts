import { isDev } from '@deepz/config'

import { User, Guild } from './connection'

export const initializeDatabase = () =>
  Promise.all([User.sync({ alter: isDev }), Guild.sync({ alter: isDev })])
export * as UserDAL from './dal/user'
export * as GuildDAL from './dal/guild'
