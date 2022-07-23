import { RepeatMode } from 'discord-music-player'

import logger from '@deepz/logger'
import { isInteraction } from '@helpers'
import { Command } from '@structures'

export default new Command({
  name: 'loop',
  description: 'Loops the current song or queue!',
  category: 'AUDIO',
  slash: 'both',
  options: [
    {
      name: 'queue',
      description: 'Loops the current queue',
      type: 'SUB_COMMAND',
    },
    {
      name: 'song',
      description: 'Loops only the current song from the queue',
      type: 'SUB_COMMAND',
    },
    {
      name: 'disable',
      description: 'Disable the loop',
      type: 'SUB_COMMAND',
    },
  ],
  run: async ({ client, args, interaction }) => {
    const subcommand = isInteraction(args) ? args.getSubcommand() : args[0]

    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      if (subcommand === 'song') {
        queue.setRepeatMode(RepeatMode.SONG)

        return `***Looping the current song!***`
      }

      if (subcommand === 'queue') {
        queue.setRepeatMode(RepeatMode.QUEUE)

        return `***Looping the current queue!***`
      }

      if (subcommand === 'disable') {
        queue.setRepeatMode(RepeatMode.DISABLED)

        return `***Loop disabled!***`
      }
    } catch (error) {
      logger.error(error)
    }
  },
})
