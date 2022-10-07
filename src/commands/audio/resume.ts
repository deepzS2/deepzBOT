import { stripIndent } from 'common-tags'
import { Player } from 'discord-music-player'
import { MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'resume',
  description: 'Resumes the current song and queue!',
  category: 'AUDIO',
})
export default class ResumeCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  async run({
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue = await this._player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.setPaused(false)

      return stripIndent`
        ***Music has been resumed! Use \`/pause\` to pause the music***
      `
    } catch (error) {
      this._logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  }
}
