import { stripIndent } from 'common-tags'
import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'resume',
  description: 'Resumes the current song and queue!',
  category: 'AUDIO',
})
export default class ResumeCommand extends BaseCommand {
  async run({
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const queue = await client.player.getQueue(interaction.guildId)

      if (!queue || !queue.connection)
        return `***There are no songs in the queue...***`

      queue.setPaused(false)

      return stripIndent`
        ***Music has been resumed! Use \`/pause\` to pause the music***
      `
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to shuffle the queue...***`
    }
  }
}
