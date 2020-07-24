import { Command } from '@customTypes/commands'
import { User } from '@customTypes/database'
import { CommandContext } from '@models/command_context'

import connection from '../../../database'
import functions from '../../functions'

export default class MoneyCommand implements Command {
  commandNames = ['credits', 'credit', 'money', 'balance']
  commandExamples = [
    {
      example: 'd.credits',
      description: 'Check your credit balance',
    },
    {
      example: 'd.credits @『 ♥ deepz ♥ 』#4008 1000',
      description: 'Transfer 1000 credits to deepz',
    },
    {
      example: 'd.credits @『 ♥ deepz ♥ 』#4008 check',
      description: 'Check deepz current credit balance',
    },
  ]

  commandCategory = 'Economy'

  commandUsage = 'd.credits [user] [amount]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}credits transfer money to someone or see your current balance.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const { balance } = await connection('users')
      .where('id', '=', originalMessage.author.id)
      .first()
      .select('balance')

    if (args.length === 0) {
      originalMessage.channel.send(
        `**:credit_card:  | ${originalMessage.author.username}, you current balance is :yen: ${balance} credits.**`
      )
    } else {
      const mention = functions.getMember(originalMessage, args[0])

      console.log(args[0], mention)

      if (mention.id === originalMessage.author.id) {
        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, you can't make a transaction to yourself.**`
        )
        return
      }

      if (args[1] === 'check' || !args[1]) {
        const user = await connection<User>('users')
          .where('id', '=', mention.user.id)
          .first()
          .select('balance')

        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, ${mention.user.username} has a balance of :yen: ${user.balance} credits!**`
        )
        return
      }

      if (balance === 0 || balance < args[1]) {
        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, you have insufficient credits to make this transaction.**`
        )
        return
      }

      await connection('users')
        .where('id', '=', originalMessage.author.id)
        .first()
        .decrement('balance', Number(args[1]))

      await connection('users')
        .where('id', '=', mention.id)
        .first()
        .increment('balance', Number(args[1]))
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
