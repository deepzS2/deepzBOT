import { ApplicationCommandOptionType } from 'discord.js'

import { getMentions, isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { tenor } from '@deepz/services'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'hug',
  description: 'Hug a user!',
  category: 'FUNNY',
  slash: 'both',
  options: [
    {
      name: 'user',
      description: 'User to hug',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  examples: ['d.kiss @user'],
  run: async ({ interaction, args, message }) => {
    const user = isInteraction(args)
      ? args.getUser('user')
      : getMentions(message).first()

    try {
      const result = await tenor.search({
        query: 'hug anime',
        type: 'gif',
      })

      const gifs = result.results
      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      return new CustomMessageEmbed(' ', {
        image: gifs[toSend].media[0].gif.url,
        color: '#4360FB',
        description: `***${
          interaction?.user.username || message?.author.id
        }, you hugged ${user.username} :smiling_face_with_3_hearts:***`,
      })
    } catch (error) {
      logger.error(error)
    }
  },
})
