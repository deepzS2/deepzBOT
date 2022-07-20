import { stripIndent } from 'common-tags'

import logger from '@deepz/logger'
import { Command } from '@structures'

export default new Command({
  name: 'shuffle',
  description: 'Shuffles the entire song queue!',
  category: 'AUDIO',
  slash: 'both',
  run: async ({ client, interaction }) => {
    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.shuffle()

      return stripIndent`
        ***The queue of ${queue.tracks.length} songs have been shuffled!***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  },
})
