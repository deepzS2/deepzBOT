import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import Tenor from '@utils/tenor'

import functions from '../../functions'

export default class KissCommand implements Command {
  commandNames = ['slap']
  commandExamples = [
    {
      example: 'd.slap @『 ♥ deepz ♥ 』#4008',
      description: "He needs a... Wait, what? He don't need that...",
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.slap <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}slap to slap someone :angry:.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    try {
      if (!args[0]) {
        originalMessage.channel.send(
          'Mention someone to slap :hand_splayed: ...'
        )

        return
      }

      const member = functions.getMember(originalMessage, args[0])

      if (!member || member.user.id === originalMessage.author.id) {
        originalMessage.channel.send(`**Please mention someone...**`)
        return
      }

      const gifs = await Tenor.Search.Query('slap anime', '10')

      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      const embed = new MessageEmbed()
        .setImage(gifs[toSend].media[0].gif.url)
        .setColor('#4360FB')

      originalMessage.channel.send(
        `**${originalMessage.author.username}, you just slapped ${member} :angry:**`,
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
