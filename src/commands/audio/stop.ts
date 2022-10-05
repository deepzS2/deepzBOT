import { stripIndent } from 'common-tags'

import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'stop',

  description: 'Stops the bot and clears the queue!',
  category: 'AUDIO',

  examples: ['d.stop'],
  run: async ({ client, interaction }) => {
    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.stop()

      return stripIndent`
        ***Music queue stopped... Thanks for listening!***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  },
})
