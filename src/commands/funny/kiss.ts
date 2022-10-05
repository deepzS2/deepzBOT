import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { tenor } from '@deepz/services'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'kiss',
  description: 'Kiss a user!',
  category: 'FUNNY',
  options: [
    {
      name: 'user',
      description: 'User to kiss',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
})
export default class KissCommand extends BaseCommand {
  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user = args.getUser('user')

    try {
      const result = await tenor.search({
        query: 'kiss anime',
        type: 'gif',
      })

      const gifs = result.results
      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      return new CustomMessageEmbed(' ', {
        image: gifs[toSend].media[0].gif.url,
        color: '#4360FB',
        description: `***${interaction.user.username}, you kissed <@${user.id}> :kissing_heart:***`,
      })
    } catch (error) {
      logger.error(error)

      return `***Error trying to kiss <@${user.id}>, try again later...`
    }
  }
}
