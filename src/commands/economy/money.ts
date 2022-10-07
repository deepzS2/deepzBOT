import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

@Command({
  name: 'money',
  description:
    'Gets your current balance, transfer money or check other persons balance!',
  category: 'ECONOMY',
  options: [
    {
      name: 'user',
      description: 'User to transfer or check balance',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'amount',
      description: 'Amount to transfer to the user',
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
})
export default class MoneyCommand extends BaseCommand {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user = args.getUser('user')
    const amount = args.getNumber('amount')

    try {
      const author = await this._database.user.findUniqueOrThrow({
        where: {
          discordId: interaction.user.id,
        },
      })

      if (!user && isNaN(amount)) {
        return `**:credit_card:  | ${author.username}, you current balance is :yen: ${author.balance} credits.**`
      }

      const mentioned = await this._database.user.findUniqueOrThrow({
        where: {
          discordId: user.id,
        },
      })

      if (!amount || isNaN(amount)) {
        return `**:credit_card:  | ${author.username}, ${mentioned.username} has a balance of :yen: ${mentioned.balance} credits!**`
      }

      if (mentioned.discordId === author.discordId) {
        return `**:credit_card:  | ${author.username}, you can't make a transaction to yourself.**`
      }

      if (amount > author.balance) {
        return `**:credit_card:  | ${author.username}, you have insufficient credits to make this transaction.**`
      }

      await this._database.user.update({
        where: {
          id: mentioned.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      })
      await this._database.user.update({
        where: {
          id: author.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })
    } catch (error) {
      this._logger.error(error)

      return `Error trying to get or transfer balance, try again later...`
    }
  }
}
