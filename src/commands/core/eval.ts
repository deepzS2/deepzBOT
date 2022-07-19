import beautify from 'beautify'
import { CommandInteractionOptionResolver } from 'discord.js'

import { botConfig } from '@deepz/config'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'eval',
  description: 'Evaluates some code!',
  options: [
    {
      name: 'code',
      description: 'The code in JavaScript to evaluate!',
      type: 'STRING',
      required: true,
    },
  ],
  category: 'CORE',
  slash: 'both',
  run: async ({ client, interaction, args }) => {
    if (interaction.user.id !== botConfig.ownerId)
      return `***Sorry... You can't use that***`

    const toEval = (args as CommandInteractionOptionResolver).getString('code')

    try {
      const evaluated = eval(toEval)

      return new CustomMessageEmbed('Eval', {
        color: '#4360FB',
        timestamp: true,
        footer: {
          text: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        },
      })
        .addField(
          'To evaluate:',
          `\`\`\`js\n${beautify(toEval, { format: 'js' })}\n\`\`\``
        )
        .addField(
          'Evaluated:',
          typeof evaluated === 'object'
            ? beautify(JSON.stringify(evaluated), { format: 'json' })
            : evaluated
        )
        .addField('Typeof:', typeof evaluated)
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
