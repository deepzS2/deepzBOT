import dotenv from 'dotenv'

import { BotConfig } from '@customTypes/client'

// .env
dotenv.config()

const config: BotConfig = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  botOwnerRoleName: process.env.BOT_OWNER_ROLE_NAME,
  enableReactions: true,
}

export default config
