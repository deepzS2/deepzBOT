import { Client } from 'discord.js'

import { validateConfig, botConfig as config } from './config'
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
