import dotenv from 'dotenv'
import {ConnectionOptions} from 'typeorm'

import {BotConfiguration} from '@customTypes/environment'

// .env
dotenv.config()

export const botConfig: BotConfiguration = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  botOwnerRoleName: process.env.BOT_OWNER_ROLE_NAME,
  enableReactions: true,
  guildId: process.env.GUILD.toString(),
}

export const databaseConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  synchronize: true,
  logging: false,
}
