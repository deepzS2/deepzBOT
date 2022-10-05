import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: '8ball',
  description: 'Displays the information about the bot!',
  category: 'FUNNY',
  options: [
    {
      name: 'question',
      description: 'Question',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
})
export default class EightBallCommand extends BaseCommand {
  private readonly replies = ['Yes.', 'No.', "I don't know.", 'Ask again later']

  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const question = args.getString('question')

    if (!question) return `**:x: Ask me something...**`

    const answer = this.replies[Math.floor(Math.random() * this.replies.length)]

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
  }
}
