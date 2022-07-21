import { stripIndents } from 'common-tags'

import logger from '@deepz/logger'
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
  run: async ({ interaction }) => {
    try {
      const amount = interaction.options.getInteger('amount')

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
