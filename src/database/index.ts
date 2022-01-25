import { Sequelize } from "sequelize"
import UserModel from './models/User'
import GuildModel from './models/Guild'
import { databaseConfig, isDev } from '../config'

export const connection = new Sequelize(databaseConfig.name, databaseConfig.username, databaseConfig.password, {
  host: databaseConfig.host,
  port: databaseConfig.port,
  dialect: databaseConfig.dialect,
  logging: databaseConfig.logging,
  storage: databaseConfig.storage
})

export const User = UserModel(connection)
export const Guild = GuildModel(connection)

export const initializeDatabase = () => Promise.all([
  User.sync({ alter: isDev }),
  Guild.sync({ alter: isDev })
])