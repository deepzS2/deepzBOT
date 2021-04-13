import { Client } from 'discord.js'

import { BotConfig } from '@customTypes/client'

import config from './config'
import Listeners from './listeners'

validateConfig(config)

const client = new Client({
  allowedMentions: {
    parse: ['everyone'],
  },
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
})

const listeners = new Listeners(client, config)

listeners.start()

client.login(config.token)

/**
 * Checks if the user provided a token
 * @param config The bot configuration (token, prefix, etc.)
 */
function validateConfig(config: BotConfig) {
  if (!config.token) {
    throw new Error('You need to specify your Discord bot token!')
  }
}
