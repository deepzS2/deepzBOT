import { stripIndent } from 'common-tags'
import { Player, Queue } from 'discord-music-player'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'queue',
  description: 'Displays the current playing queue!',
  category: 'AUDIO',
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: 'page',
      description: 'Page number of the queue',
      minValue: 1,
    },
  ],
})
export default class QueueCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player
  private readonly SONGS_PER_PAGE = 10

  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue: Queue = await this._player.getQueue(interaction.guildId)
      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const pages = Math.ceil(queue.songs.length / this.SONGS_PER_PAGE) || 1
      const currentPage = args.getNumber('page') || 1

      if (currentPage > pages)
        return `***Wait... There are only ${pages} pages in this queue!***`

      const queueString = queue.songs
        .slice(
          (currentPage - 1) * this.SONGS_PER_PAGE,
          (currentPage - 1) * this.SONGS_PER_PAGE + this.SONGS_PER_PAGE
        )
        .map((track, i) => {
          return `**${(currentPage - 1) * this.SONGS_PER_PAGE + i + 1}.** \`[${
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
      this._logger.error(error)

      return `***Something went wrong trying to get the queue...***`
    }
  }
}
