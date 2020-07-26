import Discord from 'discord.js'

import { BotConfig } from '@customTypes/client'

import config from './config'
import listeners from './listeners'

validateConfig(config)

const client = new Discord.Client({
  allowedMentions: {
    parse: ['everyone'],
  },
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
})

client.once('ready', listeners.ready)

client.once('disconnect', () => {
  console.log('Disconnect!')
})

client.on('message', listeners.message)

client.on('messageReactionAdd', listeners.messageReactionAdd)

client.on('messageReactionRemove', listeners.messageReactionRemove)

client.on('error', (e) => {
  console.error('Discord client error!', e)
})

client.on('guildCreate', listeners.guildCreate)

client.on('guildDelete', listeners.onGuildDelete)

/**
 * Checks if the user provided a token
 * @param config The bot configuration (token, prefix, etc.)
 */
function validateConfig(config: BotConfig) {
  if (!config.token) {
    throw new Error('You need to specify your Discord bot token!')
  }
}

export default client
