import { stripIndent } from 'common-tags'
import { Queue } from 'discord-music-player'

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
      const queue: Queue = await client.player.getQueue(interaction.guildId)
      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const pages = Math.ceil(queue.songs.length / SONGS_PER_PAGE) || 1
      const currentPage = interaction.options.getNumber('page') || 1

      if (currentPage > pages)
        return `***Wait... There are only ${pages} pages in this queue!***`

      const queueString = queue.songs
        .slice(
          (currentPage - 1) * SONGS_PER_PAGE,
          (currentPage - 1) * SONGS_PER_PAGE + SONGS_PER_PAGE
        )
        .map((track, i) => {
          return `**${(currentPage - 1) * SONGS_PER_PAGE + i + 1}.** \`[${
            track.duration
          }]\` ${track.name} -- <@${track.requestedBy.id}>\n`
        })

      const currentSong = queue.nowPlaying

      return new CustomMessageEmbed(' ', {
        description:
          `**Current playing**\n` +
          stripIndent`
                ${
                  currentSong
                    ? `\`[${currentSong.duration}]\` ${currentSong.name} -- <@${currentSong.requestedBy.id}>`
                    : 'None'
                }
                \n\n
                **Queue**\n${queueString.join('\n')}
              `,
        footer: {
          text: `Page ${currentPage} of ${pages}`,
        },
        thumbnail: currentSong.thumbnail,
      })
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to get the queue...***`
    }
  },
})
