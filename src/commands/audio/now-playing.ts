import { Queue } from 'discord-music-player'
import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'nowplaying',
  description: 'Display the current playing song information!',
  category: 'AUDIO',
})
export default class NowPlayingCommand extends BaseCommand {
  async run({
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue: Queue = await client.player.getQueue(interaction.guildId)

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
      logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  }
}
