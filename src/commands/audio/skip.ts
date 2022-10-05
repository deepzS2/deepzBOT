import { Queue } from 'discord-music-player'
import { ApplicationCommandOptionType } from 'discord.js'

import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'skip',

  description: 'Skips the current song!',
  category: 'AUDIO',
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: 'to',
      description: 'The track to skip to',
      required: false,
    },
  ],

  examples: ['d.skip', 'd.skip 3'],
  run: async ({ client, interaction, args }) => {
    try {
      const queue: Queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const skipDestination = args.getNumber('to')

      if (!skipDestination || isNaN(skipDestination)) {
        const currentSong = queue.nowPlaying

        queue.skip()

        return new CustomMessageEmbed(' ', {
          description: `${currentSong.name} has been skipped!`,
          thumbnail: currentSong.thumbnail,
        })
      }

      if (skipDestination > queue.songs.length)
        return `***Invalid track index***`

      queue.skip(skipDestination - 1)

      return `***Skipped ahead to track ${skipDestination} index***`
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  },
})
