import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js'

import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'clear',
  description: 'Clear the message history!',
  category: 'MODERATION',

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
  run: async ({ interaction, args }) => {
    try {
      const amount = args.getInteger('amount')
      const author = interaction.user
      const bot = interaction.guild.members.me

      if (!bot.permissions.has(PermissionFlagsBits.ManageMessages))
        return `I don't have permission to manage messages on this server...`

      if (isNaN(amount)) return `***Please provide a valid number...***`

      const { size } = await interaction.channel.bulkDelete(amount)

      return `***Deleted ${size} message(s) requested by <@${author.id}>.***`
    } catch (error) {
      logger.error(error)

      return `***I could not delete the messages! Try again later...***`
    }
  },
})
