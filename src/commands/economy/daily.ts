import ms from 'parse-ms'

import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
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
    const Users = await UsersRepository()

    const timeout = 86400000
    const amount = Math.floor(Math.random() * 1000) + 1

    const author = await Users.findOneOrFail({
      where: { id: originalMessage.author.id },
    })

    if (
      author.daily !== null &&
      timeout - this.getTimeRemaining(author.daily) > 0
    ) {
      const time = ms(timeout - this.getTimeRemaining(author.daily))

      originalMessage.channel.send(
        `**:yen:  | You already take your daily... Come back in ${time.hours}h ${time.minutes}m ${time.seconds}s**`
      )
    } else {
      originalMessage.channel.send(
        `**${originalMessage.author.username}, here's your daily money: :yen: ${amount} credits!**`
      )

      author.daily = new Date()
      author.balance += amount

      await Users.save(author)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }

  getTimeRemaining(date: Date): number {
    return Date.now() - new Date(date).getTime()
  }
}
