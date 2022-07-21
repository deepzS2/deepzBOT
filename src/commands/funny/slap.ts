import logger from '@deepz/logger'
import { tenor } from '@services'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'slap',
  description: 'Slaps a user!',
  category: 'FUNNY',
  slash: 'both',
  options: [
    {
      name: 'user',
      description: 'User to slap',
      type: 'USER',
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const user = interaction.options.getUser('user')

    try {
      const result = await tenor.search({
        query: 'slap anime',
        type: 'gif',
      })

      console.dir(result)

      const gifs = result.results
      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      return new CustomMessageEmbed(' ', {
        image: gifs[toSend].media[0].gif.url,
        color: '#4360FB',
        description: `***${interaction.user.username}, you slapped ${user.username} :angry:***`,
      })
    } catch (error) {
      logger.error(error)
    }
  },
})
