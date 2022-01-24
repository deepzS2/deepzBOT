import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import Tenor from '@utils/tenor'

import functions from '../../functions'

export default class GoodMorningCommand implements Command {
  commandNames = ['goodmorning', 'gm', 'bomdia']
  commandExamples = [
    {
      example: 'd.goodmorning @『 ♥ deepz ♥ 』#4008',
      description: 'Sends a good morning to deepz 🥱',
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.goodmorning <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}goodmorning to send a good morning to someone 🥱.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    try {
      if (!args[0]) {
        originalMessage.channel.send('Mention someone to send good morning...')

        return
      }

      const member = functions.getMember(originalMessage, args[0])

      if (!member || member.user.id === originalMessage.author.id) {
        originalMessage.channel.send(`**Please mention someone...**`)
        return
      }

      const gifs = await Tenor.Search.Query('morning anime', '10')

      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      const embed = new MessageEmbed()
        .setImage(gifs[toSend].media[0].gif.url)
        .setColor('#4360FB')

      originalMessage.channel.send(
        `${originalMessage.author.username} just sent a good morning to ${member} 🥱`,
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
