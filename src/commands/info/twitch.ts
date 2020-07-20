import { Message, Client } from 'discord.js'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'
import { tickTwitchCheck } from '@utils/twitch'

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
        await addToDatabase(value, serverId)
        msg.channel.send(
          `**Added ${value} successfully to the guilds twitch user notifications!**`
        )
        return tickTwitchCheck(bot)
      } else {
        return msg.channel.send(`**:x: Twitch username invalid!**`)
      }
    } else if (action === 'remove') {
      const { twitchs } = await connection('guilds')
        .where('id', '=', serverId)
        .first()
        .select('twitchs')

      const newTwitchs = twitchs.map((twitch) => twitch !== value)

      await connection('guilds').where('id', '=', serverId).update({
        twitchs: newTwitchs,
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
    } else {
      return await msg.channel.send(
        `**:x: Please provide an argument! Try \`d.help twitch\`.**`
      )
    }
  } catch (error) {
    if (error.message === 'Already exists') {
      return msg.channel.send(`**:x: User already registered in guild!**`)
    } else {
      console.error(error)
      return msg.channel.send(
        `**:x: Something went wrong, please try again later!**`
      )
    }
  }
}

async function addToDatabase(value: string, serverId: string) {
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
    } else {
      const alreadyExists = twitchs.find((twitch) => twitch === value)

      if (alreadyExists) {
        return new Error('Already exists')
      }

      await connection('guilds')
        .where('id', '=', serverId)
        .update({
          twitchs: twitchs.push(value),
        })
    }
  } catch (error) {
    console.error(error)
  }
}
