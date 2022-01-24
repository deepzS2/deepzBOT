import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class InviteCommand implements Command {
  commandNames = ['invite']
  commandExamples = [
    {
      example: 'd.invite',
      description: 'OMG! I would love if you join the other servers I have...',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.invite'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}invite to see the bot invite URL.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    originalMessage.channel.send(
      `**Here's my invite: https://discord.com/oauth2/authorize?client_id=709564503053828137&scope=bot&permissions=334621766**`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
