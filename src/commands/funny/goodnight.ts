import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import Tenor from '@utils/tenor'

import functions from '../../functions'

export default class GoodNightCommand implements Command {
  commandNames = ['goodnight', 'gn', 'boanoite']
  commandExamples = [
    {
      example: 'd.goodnight @『 ♥ deepz ♥ 』#4008',
      description: 'Sends a good night to deepz :blush:',
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.goodnight <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}goodnight to send a good night to someone 😴zzzz.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    try {
      if (!args[0]) {
        originalMessage.channel.send(
          'Mention someone to send good night :zzz::zzz:'
        )

        return
      }

      const member = functions.getMember(originalMessage, args[0])

      if (
        (originalMessage.mentions.members.first() &&
          originalMessage.mentions.members.first().user ===
            originalMessage.author) ||
        originalMessage.author.username
          .toLowerCase()
          .includes(args[0].toLowerCase())
      ) {
        originalMessage.channel.send('**Sending a good night to yourself?**')

        return
      } else if (
        !member.user.username.toLowerCase().includes(args[0].toLowerCase())
      ) {
        originalMessage.channel.send(`**Sorry, User not found... :(**`)

        return
      }

      const gifs = await Tenor.Search.Query('sleeping anime', '10')

      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      const embed = new MessageEmbed()
        .setImage(gifs[toSend].media[0].gif.url)
        .setColor('#4360FB')

      originalMessage.channel.send(
        `${originalMessage.author.username} just sent a good night to ${member} :zzz: :sleeping:`,
        embed
      )
    } catch (error) {
      console.error(error)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
