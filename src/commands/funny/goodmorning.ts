import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

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

  async run({ originalMessage }: CommandContext): Promise<void> {
    originalMessage.delete().catch((O_o) => {
      console.error(O_o)
    })
    const member = functions.getMember(originalMessage)
    if (!member) {
      originalMessage.channel.send('Mention someone to send good morning...')

      return
    }

    originalMessage.channel.send(
      `${originalMessage.author.username} just sent a good morning to ${member} 🥱`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
