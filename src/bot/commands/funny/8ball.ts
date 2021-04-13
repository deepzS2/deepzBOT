import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class EightBallCommand implements Command {
  commandNames = ['8ball']
  commandExamples = [
    {
      example: 'd.8ball deepz creator is gay?',
      description: "That's a hard question tho...",
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.8ball'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}8ball to ask the bot something and he will answer you.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel.send(`**:x: Ask me something...**`)
    }

    const replies = ['Yes.', 'No.', "I don't know.", 'Ask again later']

    const result = Math.floor(Math.random() * replies.length)
    const question = args.join(' ')

    const embed = new MessageEmbed()
      .setAuthor(originalMessage.author.tag)
      .setColor('#4360FB')
      .addField('Question', question)
      .addField('Answer', replies[result])

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
