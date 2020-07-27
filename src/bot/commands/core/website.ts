import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class EvalCommand implements Command {
  commandNames = ['website', 'web']
  commandExamples = [
    {
      example: 'd.about',
      description: 'My website!',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.website'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}website to get the bot website.`
  }

  async run({ originalMessage, bot }: CommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(`Website`)
      .setColor('#4360FB')
      .setDescription(
        '[You can access my website here](https://deepzin.herokuapp.com/)'
      )
      .setThumbnail(bot.user.displayAvatarURL())

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
