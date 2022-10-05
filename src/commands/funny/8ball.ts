import { ApplicationCommandOptionType } from 'discord.js'

import { Command, CustomMessageEmbed } from '@deepz/structures'

const replies = ['Yes.', 'No.', "I don't know.", 'Ask again later']

export default new Command({
  name: '8ball',
  description: 'Displays the information about the bot!',
  category: 'FUNNY',

  examples: ['d.8ball should I create my own bot?'],
  options: [
    {
      name: 'question',
      description: 'Question',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ interaction, args }) => {
    const question = args.getString('question')

    if (!question) return `**:x: Ask me something...**`

    const answer = replies[Math.floor(Math.random() * replies.length)]

    return new CustomMessageEmbed('8ball', {
      color: '#4360FB',
      author: {
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
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
