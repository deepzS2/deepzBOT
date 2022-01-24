import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
import { CommandContext } from '@models/command_context'

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
    const Users = await UsersRepository()
    const author = await Users.findOneOrFail({
      where: { id: originalMessage.author.id },
    })

    // Get current author money
    if (args.length === 0) {
      originalMessage.channel.send(
        `**:credit_card:  | ${originalMessage.author.username}, you current balance is :yen: ${author.balance} credits.**`
      )
    } else {
      const mention = functions.getMember(originalMessage, args[0])
      const mentionedUser = await Users.findOneOrFail({
        where: { id: mention.user.id },
      })

      if (mention.id === originalMessage.author.id) {
        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, you can't make a transaction to yourself.**`
        )
        return
      }

      // Check the mentioned user balance
      if (args[1] === 'check' || !args[1]) {
        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, ${mention.user.username} has a balance of :yen: ${mentionedUser.balance} credits!**`
        )
        return
      }

      const amount = Number(args[1])

      // Not a number...
      if (isNaN(amount)) return

      // Check money amount before transaction
      if (author.balance === 0 || author.balance < Number(amount)) {
        originalMessage.channel.send(
          `**:credit_card:  | ${originalMessage.author.username}, you have insufficient credits to make this transaction.**`
        )
        return
      }

      author.balance -= amount
      mentionedUser.balance += amount

      await Users.save(author)
      await Users.save(mentionedUser)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
