import 'dotenv/config'
import { CategoryEmoji, BotConfiguration } from '@deepz/types/environment'

export const isProd = process.env.NODE_ENV === 'prod'
export const isDev = process.env.NODE_ENV !== 'prod'

export const botConfig: BotConfiguration = {
  token: process.env.TOKEN,
  botOwnerRoleName: process.env.BOT_OWNER_ROLE_NAME,
  enableReactions: true,
  guildId: process.env.GUILD.toString(),
  ownerId: process.env.OWNER_ID.toString(),
}

export const trackerApiKey = process.env.TRACKER_API_KEY
export const tenorKey = process.env.TENOR_KEY
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
