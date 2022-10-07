import { Player, Queue } from 'discord-music-player'
import { MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'nowplaying',
  description: 'Display the current playing song information!',
  category: 'AUDIO',
})
export default class NowPlayingCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  async run({
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue: Queue = await this._player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const bar = queue.createProgressBar({
        size: 19,
      })
      const song = queue.nowPlaying

      return new CustomMessageEmbed(' ', {
        thumbnail: song.thumbnail,
        description: `Current playing [${song.name}](${song.url})\n\n${bar}`,
      })
    } catch (error) {
      this._logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  }
}
