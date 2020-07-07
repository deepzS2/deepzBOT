import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

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

  async run({ originalMessage }: CommandContext): Promise<void> {
    originalMessage.delete().catch((O_o) => {
      console.error(O_o)
    })
    const member = functions.getMember(originalMessage)
    if (!member) {
      originalMessage.channel.send(
        'Mention someone to send good night :zzz::zzz:'
      )

      return
    }

    originalMessage.channel.send(
      `${originalMessage.author.username} just sent a good night to ${member} :zzz: :sleeping:`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
