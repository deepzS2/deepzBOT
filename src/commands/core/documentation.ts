import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class DocumentationCommand implements Command {
  commandNames = ['documentation', 'docs', 'doc']
  commandExamples = [
    {
      example: 'd.documentation',
      description: 'The documentation please...',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.documentation'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}documentation to see the bot status, etc.`
  }

  async run({ bot, originalMessage, args }: CommandContext): Promise<void> {
    const owner = await bot.users.fetch('411557789068951552')

    const { description, updated_at, pushed_at, language } = await fetch(
      'https://api.github.com/repos/deepzS2/myBot'
    )
      .then((res) => res.json())
      .catch((err) => {
        console.error(err)
        return originalMessage.channel.send(
          `**:x: Something went wrong! Possibly with Github API! Try again later...**`
        )
      })

    const {
      commit: { message },
    } = await fetch('https://api.github.com/repos/deepzS2/myBot/commits/master')
      .then((res) => res.json())
      .catch((err) => {
        console.error(err)
        return originalMessage.channel.send(
          `**:x: Something went wrong! Possibly with Github API! Try again later...**`
        )
      })

    const embed = new MessageEmbed()
      .setAuthor(
        owner.username,
        owner.displayAvatarURL(),
        'https://github.com/deepzS2/myBot'
      )
      .setColor('#4360FB')
      .setDescription(description)
      .setTitle('**deepz documentation**')
      .setThumbnail(bot.user.displayAvatarURL())
      .addField(
        'Informations',
        stripIndents`**Last time updated:** ${new Date(
          updated_at
        ).toLocaleString()}
        **Last push request:** ${new Date(pushed_at).toLocaleString()}
        **Language used:** ${language}
        **Status:** Under development...`
      )

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
