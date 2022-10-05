import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'love',
  description: 'Calculate the love affinity you have for another person!',
  category: 'FUNNY',
  options: [
    {
      name: 'user',
      description: 'User to calculate affinity',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
})
export default class LoveCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user = args.getUser('user')

    try {
      const love = Math.random() * 100

      const loveIndex = Math.floor(love / 10)
      const loveLevel = '💖'.repeat(loveIndex) + '💔'.repeat(10 - loveIndex)

      return new CustomMessageEmbed(' ', {
        color: '#4360FB',
        thumbnail: user.displayAvatarURL(),
        fields: [
          {
            name: `☁ **<@${user.id}>** loves **<@${interaction.user.id}>** this much:`,
            value: `💟 ${Math.floor(love)}%\n\n${loveLevel}`,
            inline: false,
          },
        ],
      })
    } catch (error) {
      logger.error(error)

      return `***Error trying calculate love affinity with <@${user.id}>, try again later...`
    }
  }
}
