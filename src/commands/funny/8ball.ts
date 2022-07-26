import { stripIndents } from 'common-tags'

import { botConfig } from '@deepz/config'
import { isInteraction } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

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
      type: 'STRING',
      required: true,
    },
  ],
  run: async ({ client, message, interaction, args }) => {
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
        },
        {
          name: 'Answer',
          value: answer,
        },
      ],
    })
  },
})
