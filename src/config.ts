import 'dotenv/config'
import {
  CategoryEmoji,
  BotConfiguration,
  DatabaseConfiguration,
} from '@deepz/types/environment'

/**
 * Check if node env is 'dev'
 */
export const isDev = process.env.NODE_ENV !== 'prod'

/**
 * Bot configuration environment variables
 */
export const botConfig: BotConfiguration = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  botOwnerRoleName: process.env.BOT_OWNER_ROLE_NAME,
  enableReactions: true,
  guildId: process.env.GUILD.toString(),
  ownerId: process.env.OWNER_ID.toString(),
}

/**
 * Bot database environment variables
 * Note that storage is for sqlite3 (development environment)
 */
export const databaseConfig: DatabaseConfiguration = {
  dialect: isDev ? 'sqlite' : 'postgres',
  name: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  storage: 'database.sqlite',
  logging: false,
}

export const steamToken = process.env.STEAM_TOKEN

export const embedGlobalColor = '#483D3F'

export const categoryEmojis: CategoryEmoji[] = [
  {
    name: 'INFO',
    emoji: '🔎',
  },
  {
    name: 'FUNNY',
    emoji: '😄',
  },
  {
    name: 'ECONOMY',
    emoji: '⚖️',
  },
  {
    name: 'SOCIAL',
    emoji: '👤',
  },
  {
    name: 'CORE',
    emoji: 'ℹ️',
  },
  {
    name: 'AUDIO',
    emoji: '🎶',
  },
  {
    name: 'MODERATION',
    emoji: '👁️',
  },
  {
    name: 'GAMES',
    emoji: '🎮',
  },
]
