import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { tenor } from '@deepz/services'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'slap',
  description: 'Slaps a user!',
  category: 'FUNNY',
  options: [
    {
      name: 'user',
      description: 'User to slap',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
})
export default class SlapCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user = args.getUser('user')

    try {
      const result = await tenor.search({
        query: 'slap anime',
        type: 'gif',
      })

      const gifs = result.results
      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      return new CustomMessageEmbed(' ', {
        image: gifs[toSend].media[0].gif.url,
        color: '#4360FB',
        description: `***${interaction.user.username}, you slapped ${user.username} :angry:***`,
      })
    } catch (error) {
      logger.error(error)

      return `***Error trying to slap <@${user.id}>, try again later...`
    }
  }
}
