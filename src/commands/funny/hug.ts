import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import Tenor from '@utils/tenor'

import functions from '../../functions'

export default class HugCommand implements Command {
  commandNames = ['hug']
  commandExamples = [
    {
      example: 'd.hug @『 ♥ deepz ♥ 』#4008',
      description: 'He needs a hug...',
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.hug <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}hug to hug someone <3.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    try {
      if (!args[0]) {
        originalMessage.channel.send('Mention someone to send a hug...')

        return
      }

      const member = functions.getMember(originalMessage, args[0])

      if (!member || member.user.id === originalMessage.author.id) {
        originalMessage.channel.send(`**Please mention someone...**`)
        return
      }

      const gifs = await Tenor.Search.Query('hug anime', '10')

      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      const embed = new MessageEmbed()
        .setImage(gifs[toSend].media[0].gif.url)
        .setColor('#4360FB')

      originalMessage.channel.send(
        `**${originalMessage.author.username}, you just hugged ${member} :smiling_face_with_3_hearts:**`,
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
