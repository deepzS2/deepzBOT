import { Queue } from 'discord-music-player'

import logger from '@deepz/logger'
import { isInteraction } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'skip',
  aliases: ['next'],
  description: 'Skips the current song!',
  category: 'AUDIO',
  options: [
    {
      type: 'NUMBER',
      name: 'to',
      description: 'The track to skip to',
      required: false,
    },
  ],
  slash: 'both',
  examples: ['d.skip', 'd.skip 3'],
  run: async ({ client, interaction, args, message }) => {
    try {
      const queue: Queue = await client.player.getQueue(
        (interaction || message).guildId
      )

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const skipDestination = isInteraction(args)
        ? args.getNumber('to')
        : parseInt(args[0])

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
