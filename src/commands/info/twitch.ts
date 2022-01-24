import { Message, Client } from 'discord.js'

import { Command } from '@customTypes/commands'
import { GuildsRepository } from '@database'
import { CommandContext } from '@models/command_context'
import Twitch from '@utils/twitch'

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
  const Guilds = await GuildsRepository()
  const twitch = new Twitch(bot)
  value = value.toLowerCase()

  try {
    const guild = await Guilds.findOneOrFail({ where: { id: serverId } })

    if (action === 'add') {
      if (/^[a-zA-Z0-9_]{4,25}$/.test(value)) {
        return addToDatabase(value, serverId)
          .then(() => {
            msg.channel.send(
              `**Added ${value} successfully to the guilds twitch user notifications!**`
            )

            twitch.checkTwitch(value, msg.guild, bot, true)
          })
          .catch((err) => {
            if (err.message === 'Already exists')
              msg.channel.send(`**:x: ${err.message}!**`)
            else
              msg.channel.send(
                `**:x: Something went wrong! Please try again later!**`
              )
          })
      } else {
        return msg.channel.send(`**:x: Twitch username invalid!**`)
      }
    } else if (action === 'remove') {
      if (!guild.twitchs) {
        return msg.channel.send(`**:x: This guild has no twitch channels**`)
      }

      const newTwitchs = guild.twitchs.filter((twitch) => twitch !== value)

      guild.twitchs = newTwitchs

      await Guilds.save(guild)

      return msg.channel.send(
        `**Removed ${value} successfully from guilds twitch user notifications!**`
      )
    } else if (action === 'channel') {
      const channel = msg.guild.channels.cache.find((c) => c.name === value)

      guild.notification_channel = channel.id

      await Guilds.save(guild)

      return msg.channel.send(
        `**Added ${channel.name} successfully to the guilds twitch channel notifications!**`
      )
    } else if (action === 'now') {
      const guildDc = bot.guilds.cache.find((value) => value.id === serverId)

      if (guild.twitchs && guild.twitchs.length > 0) {
        guild.twitchs.forEach((value) => {
          return twitch.checkTwitch(value, guildDc, bot, true)
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

function addToDatabase(value: string, serverId: string): Promise<null> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const Guilds = await GuildsRepository()
      const guild = await Guilds.findOneOrFail({ where: { id: serverId } })

      if (!guild.twitchs || guild.twitchs.length === 0) guild.twitchs = [value]
      else {
        const alreadyExists = guild.twitchs.find((twitch) => twitch === value)

        if (alreadyExists) {
          return reject(new Error('Already exists'))
        }

        guild.twitchs.push(value)
      }

      await Guilds.save(guild)
      resolve(null)
    } catch (error) {
      return reject(error)
    }
  })
}
