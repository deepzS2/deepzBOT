import logger from '@deepz/logger'
import { isInteraction } from '@helpers'
import { Command } from '@structures'

export default new Command({
  name: 'clear',
  description: 'Clear the message history!',
  category: 'MODERATION',
  slash: 'both',
  userPermissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'amount',
      description: 'Amount of messages',
      type: 'INTEGER',
      required: true,
      minValue: 1,
      maxValue: 100,
    },
  ],
  run: async ({ interaction, args }) => {
    try {
      const amount = isInteraction(args)
        ? args.getInteger('amount')
        : parseInt(args[0])

      if (isNaN(amount)) return `***Please provide a valid number...***`

      const { size } = await interaction.channel.bulkDelete(amount)

      await interaction.channel.send({
        content: `***Deleted ${size} message(s) requested by ${interaction.user.tag}.***`,
      })
    } catch (error) {
      logger.error(error)

      await interaction.channel.send({
        content: `***I could not delete the messages! Try again later...***`,
      })
    }
  },
})
