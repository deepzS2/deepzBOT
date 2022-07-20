import { stripIndent } from 'common-tags'

import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@structures'

const SONGS_PER_PAGE = 10

export default new Command({
  name: 'queue',
  aliases: ['q'],
  description: 'Displays the current playing queue!',
  category: 'AUDIO',
  options: [
    {
      type: 'NUMBER',
      name: 'page',
      description: 'Page number of the queue',
      minValue: 1,
    },
  ],
  slash: 'both',
  run: async ({ client, interaction }) => {
    try {
      const queue = await client.player.getQueue(interaction.guildId)
      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const pages = Math.ceil(queue.tracks.length / SONGS_PER_PAGE) || 1
      const currentPage = interaction.options.getNumber('page') || 1

      if (currentPage > pages)
        return `***Wait... There are only ${pages} pages in this queue!***`

      const queueString = queue.tracks
        .slice(
          currentPage * SONGS_PER_PAGE,
          currentPage * SONGS_PER_PAGE + SONGS_PER_PAGE
        )
        .map((track, i) => {
          return `**${currentPage * SONGS_PER_PAGE + i + 1}.** \`[${
            track.duration
          }]\` ${track.title} -- <@${track.requestedBy.id}>`
        })

      const currentSong = queue.current

      return new CustomMessageEmbed(' ', {
        description:
          `**Current playing**\n` +
          stripIndent`
                ${
                  currentSong
                    ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>`
                    : 'None'
                }
                \n\n
                **Queue**\n${queueString}
              `,
        footer: {
          text: `Page ${currentPage + 1} of ${pages}`,
        },
        thumbnail: currentSong.thumbnail,
      })
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to get the queue...***`
    }
  },
})
