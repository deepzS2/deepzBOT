import { Queue } from 'discord-music-player'

import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'nowplaying',
  aliases: ['np', 'playing'],
  description: 'Display the current playing song information!',
  category: 'AUDIO',
  slash: 'both',
  examples: ['d.nowplaying'],
  run: async ({ client, interaction, message }) => {
    try {
      const queue: Queue = await client.player.getQueue(
        (interaction || message).guildId
      )

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const bar = queue.createProgressBar({
        size: 19,
      })
      const song = queue.nowPlaying

      return new CustomMessageEmbed(' ', {
        thumbnail: song.thumbnail,
        description: `Current playing [${song.name}](${song.url})\n\n${bar}`,
      })
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  },
})
