import { stripIndents } from 'common-tags'
import {
  Message,
  TextChannel,
  Guild,
  User,
  MessageReaction,
  PartialUser,
} from 'discord.js'

import { Guilds, Users } from '@database'
import { tickTwitchCheck } from '@utils/twitch'

import server from '../server'
import client from './bot'
import config from './config'
import { CommandHandler } from './handler'
// import github from '@utils/github'

const commandHandler = new CommandHandler(config.prefix, client)

export default {
  ready: async (): Promise<void> => {
    console.log('Bot ready!')
    const PORT = process.env.PORT || 3000

    const activities = [
      "try 'd.help' command",
      'made with TypeScript',
      'to be a BOT...',
    ]

    // Listening :D
    server.listen(PORT, () => {
      console.info(`Listening on port ${PORT}`)
    })

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
  },

  message: async (message: Message): Promise<void> => {
    if (process.env.NODE_ENV !== 'prod') {
      await onMessage(message)

      if (message.author.id === '411557789068951552') {
        commandHandler.handleMessage(message)
      }

      return
    }

    await onMessage(message)
    commandHandler.handleMessage(message)
  },

  messageReactionAdd: async (
    msg: MessageReaction,
    user: User | PartialUser
  ): Promise<void> => {
    await reactions(msg, user as User, 'add', (err) => {
      if (err) {
        msg.message.channel.send(`**:x: ${err.message}**`)
      }
    })
  },

  messageReactionRemove: async (
    msg: MessageReaction,
    user: User | PartialUser
  ): Promise<void> => {
    await reactions(msg, user as User, 'remove', (err) => {
      if (err) {
        msg.message.channel.send(`**:x: ${err.message}**`)
      }
    })
  },

  guildCreate: async (guild: Guild): Promise<void> => {
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
  },

  onGuildDelete,
}

/**
 * Check if user exists
 * @param id The user discord ID
 * @param username The user discord username
 */
async function checkIfUserExists(id: string, username: string) {
  try {
    const user = await Users()
      .where({
        id: id,
      })
      .select('*')
      .first()

    if (!user) {
      await Users().insert(
        {
          id: id,
          username: username,
        },
        '*'
      )
    } else if (user.username !== username) {
      await Users().where('id', '=', id).update(
        {
          username: username,
        },
        '*'
      )
    }

    return await Users().where('id', '=', id).select('*').first()
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
    await Users()
      .where('id', '=', message.author.id)
      .update({
        xp: user.xp + Math.floor(Math.random() * 15) + 10,
        balance: user.balance + Math.floor(Math.random() * 7) + 3,
      })
  }
}

async function onGuildAdd(guild: Guild) {
  await Guilds().insert({
    id: guild.id,
    name: guild.name,
  })
}

async function onGuildDelete(guild: Guild): Promise<void> {
  await Guilds().where('id', '=', guild.id).delete()
}

async function reactions(
  msg: MessageReaction,
  user: User,
  action: string,
  callback: (err?: Error) => void
) {
  try {
    const { roleMessage, roles } = await Guilds()
      .where('id', '=', msg.message.guild.id)
      .first()

    if (msg.message.id !== roleMessage) {
      return
    }

    const { role } = roles.find((value) => value.emoji === msg.emoji.name)

    const guildRole = await msg.message.guild.roles.fetch(role)

    if (action === 'add') {
      await msg.message.guild.member(user.id).roles.add(guildRole)
    } else {
      await msg.message.guild.member(user.id).roles.remove(guildRole)
    }
  } catch (error) {
    console.error(error)
    callback(error)
  }
}
