import { stripIndent } from 'common-tags'
import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'stop',
  description: 'Stops the bot and clears the queue!',
  category: 'AUDIO',
})
export default class StopCommand extends BaseCommand {
  async run({
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.stop()

      return stripIndent`
        ***Music queue stopped... Thanks for listening!***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to stop the queue...***`
    }
  }
}
