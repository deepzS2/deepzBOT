import logger from '@deepz/logger'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'nowplaying',
  aliases: ['np', 'playing'],
  description: 'Display the current playing song information!',
  category: 'AUDIO',
  slash: 'both',
  run: async ({ client, interaction }) => {
    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const bar = queue.createProgressBar({
        length: 19,
      })
      const song = queue.current

      return new CustomMessageEmbed(' ', {
        thumbnail: song.thumbnail,
        description: `Current playing [${song.title}](${song.url})\n\n${bar}`,
      })
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  },
})
