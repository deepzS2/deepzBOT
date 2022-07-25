import { stripIndent } from 'common-tags'

import logger from '@deepz/logger'
import { Command } from '@structures'

export default new Command({
  name: 'shuffle',
  description: 'Shuffles the entire song queue!',
  category: 'AUDIO',
  slash: 'both',
  examples: ['d.shuffle'],
  run: async ({ client, interaction, message }) => {
    try {
      const queue = await client.player.getQueue(
        (interaction || message).guildId
      )

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.shuffle()

      return stripIndent`
        ***The queue of ${queue.songs.length} songs have been shuffled!***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  },
})
