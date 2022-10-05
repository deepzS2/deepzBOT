import beautify from 'beautify'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { botConfig } from '@deepz/config'
import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'eval',
  description: 'Evaluates some code!',
  category: 'CORE',
  options: [
    {
      name: 'code',
      description: 'The code in JavaScript to evaluate!',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
})
export default class EvalCommand extends BaseCommand {
  async run({
    client,
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    if (interaction?.user.id !== botConfig.ownerId)
      return `***Sorry... You can't use that***`

    const toEval = args.getString('code')

    try {
      const evaluated = eval(toEval)

      return new CustomMessageEmbed('Eval', {
        color: '#4360FB',
        timestamp: true,
        footer: {
          text: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        },
      }).addFields([
        {
          name: 'To evaluate:',
          value: `\`\`\`js\n${beautify(toEval, { format: 'js' })}\n\`\`\``,
        },
        {
          name: 'Evaluated:',
          value:
            typeof evaluated === 'object'
              ? beautify(JSON.stringify(evaluated), { format: 'json' })
              : evaluated,
        },
        {
          name: 'Typeof:',
          value: typeof evaluated,
        },
      ])
    } catch (error) {
      return new CustomMessageEmbed(':x: Error!', {
        color: '#4360FB',
        description: error.message,
        footer: {
          text: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        },
      })
    }
  }
}
