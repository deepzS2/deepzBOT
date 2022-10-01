import { stripIndent } from 'common-tags'

import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'resume',
  description: 'Resumes the current song and queue!',
  category: 'AUDIO',
  slash: 'both',
  examples: ['d.resume'],
  run: async ({ client, interaction, message }) => {
    try {
      const queue = await client.player.getQueue(
        (interaction || message).guildId
      )

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.setPaused(false)

      return stripIndent`
        ***Music has been resumed! Use \`/pause\` to pause the music***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  },
})
