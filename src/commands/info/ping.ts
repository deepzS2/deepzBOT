import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class PingCommand implements Command {
  commandNames = ['ping']
  commandExamples = [
    {
      example: 'd.ping',
      description: '0ms :sunglasses:',
    },
  ]

  commandCategory = 'Info'

  commandUsage = 'd.ping'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}ping to get the bot latency.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const m = await originalMessage.channel.send(`🏓 Pinging....`)
    m.edit(
      `🏓 Pong!\nLatency is ${
        m.createdTimestamp - originalMessage.createdTimestamp
      }ms`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
