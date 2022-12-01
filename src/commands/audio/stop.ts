import { stripIndent } from 'common-tags'
import { Player } from 'discord-player'
import { MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'stop',
  description: 'Stops the bot and clears the queue!',
  category: 'AUDIO',
})
export default class StopCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  async run({
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue = await this._player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.destroy()

      return stripIndent`
        ***Music queue stopped... Thanks for listening!***
      `
    } catch (error) {
      this._logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  }
}
