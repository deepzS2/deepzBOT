import { stripIndents } from 'common-tags'
import Discord, { Message, TextChannel, Guild } from 'discord.js'

import { BotConfig } from '@customTypes/client'
import connection from '@database'
// import github from '@utils/github'
import { tickTwitchCheck } from '@utils/twitch'

import config from './config'
import { CommandHandler } from './handler'

validateConfig(config)

const client = new Discord.Client()

const commandHandler = new CommandHandler(config.prefix, client)

client.once('ready', async () => {
  console.log('Bot ready!')

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
  }, 60 * 1000)

  await tickTwitchCheck(client)
  setInterval(async () => {
    await tickTwitchCheck(client)
  }, 1000 * 60 * 30)

  // Already tested it, so in the next commit it'll be uncommented
  // await github(client)
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

client.on('guildCreate', async (guild) => {
  let found = 0
  guild.channels.cache.map((c) => {
    if (found === 0) {
      if (c.type === 'text') {
        if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === true) {
          if (c.permissionsFor(client.user).has('SEND_MESSAGES') === true) {
            ;(c as TextChannel).send(stripIndents`
            **Thanks for adding me!! My name is deepz**
            It's a honor being invited to your server! I hope we all can be friends forever :smiley:.
            For help with commands try \`d.help\` or \`d.help <command>\`.
            `)
            found = 1
          }
        }
      }
    }
  })

  await onGuildAdd(guild)
})

client.on('guildDelete', onGuildDelete)

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

async function onGuildAdd(guild: Guild) {
  await connection('guilds').insert({
    id: guild.id,
    name: guild.name,
  })
}

async function onGuildDelete(guild: Guild) {
  await connection('guilds').where('id', '=', guild.id).delete()
}
