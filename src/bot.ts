import Discord, { Message } from 'discord.js'

import { BotConfig } from '@customTypes/client'
import connection from '@database'

import config from './config'
import { CommandHandler } from './handler'
import github from './utils/github'

validateConfig(config)

const client = new Discord.Client()

const commandHandler = new CommandHandler(config.prefix, client)

client.once('ready', async () => {
  const activities = [
    "try 'd.help' command",
    'made with TypeScript',
    'to be a BOT...',
  ]

  setInterval(() => {
    const index = Math.floor(Math.random() * (activities.length - 1) + 1)
    client.user.setActivity(activities[index], {
      type: 'PLAYING',
    })
  }, 60000)

  await github(client)
})

client.once('disconnect', () => {
  console.log('Disconnect!')
})

client.on('message', async (message: Message) => {
  if (process.env.NODE_ENV !== 'prod') {
    await onMessage(message)

    if (message.author.id === '411557789068951552') {
      commandHandler.handleMessage(message)
    }

    return
  }

  await onMessage(message)
  commandHandler.handleMessage(message)
})

client.on('error', (e) => {
  console.error('Discord client error!', e)
})

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

/**
 * Check if user exists
 * @param id The user discord ID
 * @param username The user discord username
 */
async function checkIfUserExists(id: string, username: string) {
  try {
    let user = await connection('users')
      .where({
        id: id,
      })
      .select('*')
      .first()

    if (!user) {
      user = await connection('users').insert(
        {
          id: id,
          username: username,
        },
        '*'
      )
    } else if (user.username !== username) {
      user = await connection('users').where('id', '=', id).update(
        {
          username: username,
        },
        '*'
      )
    }

    return await connection('users').where('id', '=', id).select('*').first()
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Update the xp and balance when the user sends a message
 * @param message The message informations
 */
async function onMessage(message: Message) {
  if (message.author.bot) {
    return
  }

  const user = await checkIfUserExists(
    message.author.id,
    message.author.username
  )

  if (user) {
    await connection('users')
      .where('id', '=', message.author.id)
      .update({
        xp: user.xp + Math.floor(Math.random() * 15) + 10,
        balance: user.balance + Math.floor(Math.random() * 7) + 3,
      })
  }
}
