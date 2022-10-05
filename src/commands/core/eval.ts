import beautify from 'beautify'
import { ApplicationCommandOptionType } from 'discord.js'

import { botConfig } from '@deepz/config'
import { isInteraction } from '@deepz/helpers'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'eval',
  description: 'Evaluates some code!',
  options: [
    {
      name: 'code',
      description: 'The code in JavaScript to evaluate!',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  category: 'CORE',

  run: async ({ client, interaction, args, message }) => {
    if (
      interaction?.user.id !== botConfig.ownerId ||
      message?.author.id !== botConfig.ownerId
    )
      return `***Sorry... You can't use that***`

    const toEval = isInteraction(args) ? args.getString('code') : args[0]

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
  },
})
