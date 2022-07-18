import { User, Guild } from '@database/connection'
import GuildDAL from '@database/dal/guild'
import UserDAL from '@database/dal/user'
import { isDev } from '@deepz/config'

const initializeDatabase = () =>
  Promise.all([User.sync({ alter: isDev }), Guild.sync({ alter: isDev })])

export { GuildDAL, UserDAL, initializeDatabase }
