import { ApplicationCommandOptionType } from 'discord.js'

import { isInteraction } from '@deepz/helpers'
import { Command, CustomMessageEmbed } from '@deepz/structures'

const replies = ['Yes.', 'No.', "I don't know.", 'Ask again later']

export default new Command({
  name: '8ball',
  description: 'Displays the information about the bot!',
  category: 'FUNNY',
  slash: 'both',
  examples: ['d.8ball should I create my own bot?'],
  options: [
    {
      name: 'question',
      description: 'Question',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ message, interaction, args }) => {
    const question = isInteraction(args)
      ? args.getString('question')
      : args.join(' ')

    if (!question) return `**:x: Ask me something...**`

    const answer = replies[Math.floor(Math.random() * replies.length)]

    return new CustomMessageEmbed('8ball', {
      color: '#4360FB',
      author: {
        name: interaction?.user.tag ?? message?.author.tag,
        iconURL:
          interaction?.user.displayAvatarURL() ??
          message?.author.displayAvatarURL(),
      },
      fields: [
        {
          name: 'Question',
          value: question,
          inline: false,
        },
        {
          name: 'Answer',
          value: answer,
          inline: false,
        },
      ],
    })
  },
})
