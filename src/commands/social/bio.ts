import { ApplicationCommandOptionType } from 'discord.js'

import { isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'bio',
  description: 'Sets your profile biography text',
  category: 'SOCIAL',

  examples: ['d.bio My bio here'],
  options: [
    {
      name: 'text',
      type: ApplicationCommandOptionType.String,
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
