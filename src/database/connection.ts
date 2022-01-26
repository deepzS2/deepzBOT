import { Sequelize } from 'sequelize'

import CreateGuildModel, { GuildModel } from '@database/models/Guild'
import CreateUserModel, { UserModel } from '@database/models/User'
import { databaseConfig } from '@root/config'

export const connection = new Sequelize(
  databaseConfig.name,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    logging: databaseConfig.logging,
    storage: databaseConfig.storage,
  }
)

export const User: typeof UserModel = CreateUserModel(connection)
export const Guild: typeof GuildModel = CreateGuildModel(connection)
