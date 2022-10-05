import { ApplicationCommandOptionType } from 'discord.js'

import { isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'money',
  aliases: ['credits', 'balance', 'credit'],
  description:
    'Gets your current balance, transfer money or check other persons balance!',
  category: 'ECONOMY',

  examples: ['d.credits', 'd.credits @user', 'd.credits @user amount'],
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
  run: async ({ client, interaction, message, args }) => {
    const user = isInteraction(args)
      ? args.getUser('user')
      : message.mentions.users.first()
    const amount = isInteraction(args)
      ? args.getNumber('amount')
      : parseFloat(args[1])

    try {
      const author = await client.database.user.findUniqueOrThrow({
        where: {
          discordId: interaction?.user.id ?? message?.author.id,
        },
      })

      if (!user && isNaN(amount)) {
        return `**:credit_card:  | ${author.username}, you current balance is :yen: ${author.balance} credits.**`
      }

      const mentioned = await client.database.user.findUniqueOrThrow({
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

      await client.database.user.update({
        where: {
          id: mentioned.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      })
      await client.database.user.update({
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
      logger.error(error)
    }
  },
})
