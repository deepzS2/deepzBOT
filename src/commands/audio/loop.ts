import { RepeatMode } from 'discord-music-player'
import { ApplicationCommandOptionType } from 'discord.js'

import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'loop',
  description: 'Loops the current song or queue!',
  category: 'AUDIO',

  options: [
    {
      name: 'queue',
      description: 'Loops the current queue',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'song',
      description: 'Loops only the current song from the queue',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'disable',
      description: 'Disable the loop',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  examples: ['d.loop queue', 'd.loop song', 'd.loop disable'],
  run: async ({ client, args, interaction }) => {
    const subcommand = args.getSubcommand()

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
