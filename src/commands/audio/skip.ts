import { Player, Queue } from 'discord-player'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'skip',
  description: 'Skips the current song!',
  category: 'AUDIO',
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: 'to',
      description: 'The track to skip to',
      required: false,
      minValue: 1,
    },
  ],
})
export default class SkipCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue: Queue = await this._player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      const skipDestination = args.getNumber('to')

      if (!skipDestination || isNaN(skipDestination)) {
        const currentSong = queue.nowPlaying()

        queue.skip()

        return new CustomMessageEmbed(' ', {
          description: `${currentSong.title} has been skipped!`,
          thumbnail: currentSong.thumbnail,
        })
      }

      if (skipDestination > queue.tracks.length)
        return `***Invalid track index***`

      queue.skipTo(skipDestination - 1)

      return `***Skipped ahead to track ${skipDestination} index***`
    } catch (error) {
      this._logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  }
}
