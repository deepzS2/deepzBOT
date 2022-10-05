import { CommandCategory } from './command'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod'

      TOKEN: string
      PREFIX: string
      BOT_OWNER_ROLE_NAME: string
      ENABLE_REACTIONS: boolean
      ID: number
      OWNER_ID: number
      GUILD: number

      OSU_API_KEY: string
      STEAM_TOKEN: string
      TENOR_KEY: string
      TRACKER_API_KEY: string
      TWITCH_API_KEY: string
      YOUTUBE_TOKEN: string
    }
  }
}

export interface BotConfiguration {
  token: string
  botOwnerRoleName: string
  enableReactions: boolean
  guildId: string
  ownerId: string
}

export interface CategoryEmoji {
  name: CommandCategory
  emoji: string
}
