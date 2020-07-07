import ms from 'parse-ms'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'

export default class DailyMoneyCommand implements Command {
  commandNames = ['daily']
  commandExamples = [
    {
      example: 'd.daily',
      description: 'My salary!!',
    },
  ]

  commandCategory = 'Economy'

  commandUsage = 'd.daily'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}daily to get daily money.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const timeout = 86400000
    const amount = Math.floor(Math.random() * 1000) + 1

    const { daily, balance } = await connection('users')
      .where('id', '=', originalMessage.author.id)
      .first()
      .select('daily', 'balance')

    if (
      daily !== null &&
      timeout - (Date.now() - new Date(daily).getTime()) > 0
    ) {
      const time = ms(timeout - (Date.now() - new Date(daily).getTime()))

      originalMessage.channel.send(
        `**:yen:  | You already take your daily... Come back in ${time.hours}h ${time.minutes}m ${time.seconds}s**`
      )
    } else {
      originalMessage.channel.send(
        `**${originalMessage.author.username}, here's your daily money: :yen: ${amount} credits!**`
      )

      await connection('users')
        .where('id', '=', originalMessage.author.id)
        .first()
        .update(
          {
            daily: new Date().toISOString(),
            balance: Number(balance) + amount,
          },
          ['id', 'daily']
        )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
