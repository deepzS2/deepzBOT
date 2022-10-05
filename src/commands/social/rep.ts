import { User, ApplicationCommandOptionType } from 'discord.js'

import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'rep',

  description: 'Gives a reputation point to someone!',
  category: 'SOCIAL',

  examples: ['d.rep @user'],
  options: [
    {
      name: 'user',
      description: 'User to give reputation',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  run: async ({ client, interaction, args }) => {
    const user: User = args.getUser('user')

    try {
      if (!user) {
        return `**Please provide a user to give a reputation point...**`
      }

      await client.database.user.update({
        where: {
          discordId: user.id,
        },
        data: {
          reputation: {
            increment: 1,
          },
        },
      })

      return `***<@${interaction.user.id}> just gave a reputation point to <@${user.id}>`
    } catch (error) {
      logger.error(error)
    }
  },
})
