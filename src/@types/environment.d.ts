declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod' | 'debug'

      TOKEN: string
      PREFIX: string
      BOT_OWNER_ROLE_NAME: string
      ENABLE_REACTIONS: boolean
      ID: number
      GUILD: number

      OSU_API_KEY: string
      TENOR_KEY: string
      TRACKER_API_KEY: string
      TWITCH_API_KEY: string
      YOUTUBE_TOKEN: string

      DATABASE_HOST: string
      DATABASE_PORT: number
      DATABASE_USERNAME: string
      DATABASE_PASSWORD: string
      DATABASE_NAME: string
    }
  }
}

export interface BotConfiguration {
  token: string
  prefix: string
  botOwnerRoleName: string
  enableReactions: boolean
  guildId: string
}

export {}
