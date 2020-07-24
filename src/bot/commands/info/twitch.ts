import { Message, Client } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import { checkTwitch } from '@utils/twitch'

import connection from '../../../database'

export default class TwitchCommand implements Command {
  commandNames = ['twitch']
  commandExamples = [
    {
      example: 'd.twitch add deepzS2',
      description: "I'm streaming tho :flushed:",
    },
    {
      example: 'd.twitch remove deepzS2',
      description: 'Remove that streamer!',
    },
    {
      example: 'd.twitch channel twitch',
      description: 'Get the channel with the name provided to notification.',
    },
  ]

  commandCategory = 'Info'

  commandUsage =
    'd.twitch <add | remove | channel> <twitchUserName | channelName>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}twitch to set your twitch.tv user and notify everyone when you're streaming!`
  }

  async run({ originalMessage, args, bot }: CommandContext): Promise<void> {
    const action = args.shift()
    await streamManage(
      originalMessage,
      args.join(' '),
      action,
      originalMessage.guild.id,
      bot
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

async function streamManage(
  msg: Message,
  value: string,
  action: string,
  serverId: string,
  bot: Client
) {
  value = value.toLowerCase()

  try {
    if (action === 'add') {
      if (/^[a-zA-Z0-9_]{4,25}$/.test(value)) {
        return await addToDatabase(value, serverId, (err) => {
          if (err) {
            if (err.message === 'Already exists') {
              msg.channel.send(`**:x: ${err.message}!**`)

              return
            }

            msg.channel.send(
              `**:x: Something went wrong! Please try again later!**`
            )

            return
          }

          msg.channel.send(
            `**Added ${value} successfully to the guilds twitch user notifications!**`
          )

          checkTwitch(value, msg.guild, bot, true)
        })
      } else {
        return msg.channel.send(`**:x: Twitch username invalid!**`)
      }
    } else if (action === 'remove') {
      const { twitchs } = await connection('guilds')
        .where('id', '=', serverId)
        .first()
        .select('twitchs')

      console.log(twitchs)

      if (!twitchs) {
        return msg.channel.send(`**:x: This guild has no twitch channels**`)
      }

      const newTwitchs = twitchs.filter((twitch) => twitch !== value)

      await connection('guilds')
        .where('id', '=', serverId)
        .update({
          twitchs: newTwitchs.length === 0 ? null : newTwitchs,
        })

      return msg.channel.send(
        `**Removed ${value} successfully from guilds twitch user notifications!**`
      )
    } else if (action === 'channel') {
      const channel = msg.guild.channels.cache.find((c) => c.name === value)

      await connection('guilds').where('id', '=', serverId).update({
        notificationChannel: channel.id,
      })

      return msg.channel.send(
        `**Added ${channel.name} successfully to the guilds twitch channel notifications!**`
      )
    } else if (action === 'now') {
      const { twitchs } = await connection('guilds')
        .where('id', '=', serverId)
        .first()
        .select('twitchs')

      const guild = bot.guilds.cache.find((value) => value.id === serverId)

      if (twitchs && twitchs.length > 0) {
        twitchs.forEach((value) => {
          return checkTwitch(value, guild, bot, true)
        })
      }
    } else {
      return await msg.channel.send(
        `**:x: Please provide an argument! Try \`d.help twitch\`.**`
      )
    }
  } catch (error) {
    console.error(error)
    return msg.channel.send(
      `**:x: Something went wrong, please try again later!**`
    )
  }
}

async function addToDatabase(
  value: string,
  serverId: string,
  callback: (err: Error) => void
) {
  try {
    const { twitchs } = await connection('guilds')
      .where('id', '=', serverId)
      .first()
      .select('twitchs')

    if (!twitchs) {
      await connection('guilds')
        .where('id', '=', serverId)
        .update({
          twitchs: [value],
        })

      callback(null)
    } else {
      const alreadyExists = twitchs.find((twitch) => twitch === value)

      if (alreadyExists) {
        return callback(new Error('Already exists'))
      }

      twitchs.push(value)

      await connection('guilds').where('id', '=', serverId).update({
        twitchs,
      })

      callback(null)
    }
  } catch (error) {
    console.error(error)
    return callback(error)
  }
}
