import logger from '@deepz/logger'
import { isInteraction } from '@helpers'
import { Command } from '@structures'

export default new Command({
  name: 'bio',
  description: 'Sets your profile biography text',
  category: 'SOCIAL',
  slash: 'both',
  examples: ['d.bio My bio here'],
  options: [
    {
      name: 'text',
      type: 'STRING',
      description: 'The text to your bio',
      required: true,
    },
  ],
  run: async ({ client, interaction, message, args }) => {
    try {
      const bio = isInteraction(args) ? args.getString('text') : args.join(' ')

      if (!bio) return `***Please provide a text...***`

      await client.database.user.update({
        where: {
          discordId: interaction?.user.id ?? message?.author.id,
        },
        data: {
          bio,
        },
      })

      return `***Bio changed successfully!***`
    } catch (error) {
      logger.error(error)

      return `***There was an error trying to change your bio... Try again later!***`
    }
  },
})
