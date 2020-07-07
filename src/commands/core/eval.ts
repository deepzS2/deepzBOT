import beautify from 'beautify'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class EvalCommand implements Command {
  commandNames = ['eval', 'e', 'evaluate']
  commandExamples = [
    {
      example: 'd.eval message',
      description: 'Evaluate the Message discord.js type',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.eval'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}eval to evaluate some peace of code.`
  }

  async run({ bot, originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel
        .send('You need to evalue _**SOMETHING**_, please?')
        .then((m) =>
          m.delete({
            timeout: 5000,
          })
        )

      return
    }

    try {
      if (args.join(' ').toLowerCase().includes('token')) {
        return
      }

      const toEval = args.join(' ')
      // eslint-disable-next-line no-eval
      const evaluated = eval(toEval)

      const embed = new MessageEmbed()
        .setColor('#4360fb')
        .setTimestamp()
        .setFooter(bot.user.username, bot.user.displayAvatarURL())
        .setTitle('Eval')
        .addField(
          'To evaluate:',
          `\`\`\`js\n${beautify(args.join(' '), { format: 'js' })}\n \`\`\``
        )
        .addField('Evaluated:', evaluated)
        .addField('Type of:', typeof evaluated)

      originalMessage.channel.send(embed)
    } catch (error) {
      const embed = new MessageEmbed()
        .setColor('#4360fb')
        .setTitle(':x: Error!')
        .setDescription(error)
        .setFooter(bot.user.username, bot.user.displayAvatarURL())

      originalMessage.channel.send(embed)
    }
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (originalMessage.author.id !== '411557789068951552') {
      return false
    } else {
      return true
    }
  }
}
