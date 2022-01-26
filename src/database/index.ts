import { isDev } from 'config'

import { User, Guild } from '@database/connection'
import GuildDAL from '@database/dal/guild'
import UserDAL from '@database/dal/user'

const initializeDatabase = () =>
  Promise.all([User.sync({ alter: isDev }), Guild.sync({ alter: isDev })])

export { GuildDAL, UserDAL, initializeDatabase }
