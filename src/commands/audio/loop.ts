import { Player, QueueRepeatMode } from 'discord-player'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
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
})
export default class LoopCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  constructor() {
    super()
  }

  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const subcommand = args.getSubcommand()

    try {
      const queue = await this._player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      if (subcommand === 'song') {
        queue.setRepeatMode(QueueRepeatMode.TRACK)

        return `***Looping the current song!***`
      }

      if (subcommand === 'queue') {
        queue.setRepeatMode(QueueRepeatMode.QUEUE)

        return `***Looping the current queue!***`
      }

      if (subcommand === 'disable') {
        queue.setRepeatMode(QueueRepeatMode.OFF)

        return `***Loop disabled!***`
      }
    } catch (error) {
      this._logger.error(error)

      return `***Error trying to apply loop, try again later...***`
    }
  }
}
