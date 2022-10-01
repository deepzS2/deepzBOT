import { ApplicationCommandOptionType } from 'discord.js'

import { getMentions, isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'love',
  description: 'Calculate the love affinity you have for another person!',
  category: 'FUNNY',
  slash: 'both',
  options: [
    {
      name: 'user',
      description: 'User to calculate affinity',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  examples: ['d.love @user'],
  run: async ({ interaction, args, message }) => {
    const user = isInteraction(args)
      ? args.getUser('user')
      : getMentions(message).first()

    try {
      const love = Math.random() * 100

      const loveIndex = Math.floor(love / 10)
      const loveLevel = '💖'.repeat(loveIndex) + '💔'.repeat(10 - loveIndex)

      return new CustomMessageEmbed(' ', {
        color: '#4360FB',
        thumbnail: user.displayAvatarURL(),
        fields: [
          {
            name: `☁ **<@${user.id}>** loves **<@${
              (interaction?.user ?? message.author).id
            }>** this much:`,
            value: `💟 ${Math.floor(love)}%\n\n${loveLevel}`,
            inline: false,
          },
        ],
      })
    } catch (error) {
      logger.error(error)
    }
  },
})
