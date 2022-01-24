import dotenv from 'dotenv'
import { ConnectionOptions } from 'typeorm'

import { BotConfig } from '@customTypes/client'

// .env
dotenv.config()

export const botConfig: BotConfig = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  botOwnerRoleName: process.env.BOT_OWNER_ROLE_NAME,
  enableReactions: true,
}

export const databaseConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  synchronize: true,
  logging: false,
}

/**
 * Checks if the user provided a token
 * @param config The bot configuration (token, prefix, etc.)
 */
export function validateConfig(config: BotConfig): void {
  if (!config.token) {
    throw new Error('You need to specify your Discord bot token!')
  }
}
