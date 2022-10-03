import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js'

import { isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'clear',
  description: 'Clear the message history!',
  category: 'MODERATION',
  slash: 'both',
  userPermissions: ['ManageMessages'],
  options: [
    {
      name: 'amount',
      description: 'Amount of messages',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
      maxValue: 100,
    },
  ],
  run: async ({ interaction, args, message }) => {
    try {
      if (
        message &&
        !message?.member.permissions.has(PermissionFlagsBits.ManageMessages)
      )
        return `You don't have permission to use this command!`

      const amount = isInteraction(args)
        ? args.getInteger('amount')
        : parseInt(args[0])

      if (isNaN(amount)) return `***Please provide a valid number...***`

      const { size } = await interaction.channel.bulkDelete(amount)

      await (interaction || message).channel.send({
        content: `***Deleted ${size} message(s) requested by ${
          interaction?.user.tag || message?.author.tag
        }.***`,
      })
    } catch (error) {
      logger.error(error)

      await (interaction ?? message).channel.send({
        content: `***I could not delete the messages! Try again later...***`,
      })
    }
  },
})
