import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { tenor } from '@deepz/services'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'hug',
  description: 'Hug a user!',
  category: 'FUNNY',
  options: [
    {
      name: 'user',
      description: 'User to hug',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
})
export default class HugCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user = args.getUser('user')

    try {
      const result = await tenor.search({
        query: 'hug anime',
        type: 'gif',
      })

      const gifs = result.results
      const toSend = Math.floor(Math.random() * (gifs.length - 1) + 1)

      return new CustomMessageEmbed(' ', {
        image: gifs[toSend].media[0].gif.url,
        color: '#4360FB',
        description: `***${interaction.user.username}, you hugged <@${user.id}> :smiling_face_with_3_hearts:***`,
      })
    } catch (error) {
      this._logger.error(error)

      return `***Error trying to hug <@${user.id}>, try again later...`
    }
  }
}
