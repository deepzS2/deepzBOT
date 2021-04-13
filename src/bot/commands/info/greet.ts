import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class GreetCommand implements Command {
  commandNames = ['greet', 'hello']
  commandExamples = [
    {
      example: 'd.greet',
      description: 'Hello world!',
    },
  ]

  commandCategory = 'Info'

  commandUsage = 'd.greet'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}greet to get a greeting.`
  }

  async run({ bot, originalMessage }: CommandContext): Promise<void> {
    const owner = await bot.users.fetch('411557789068951552')

    const response = new MessageEmbed()
      .setTitle('**Hello World**')
      .setAuthor(
        `Owner: ${owner.username}#${owner.discriminator}`,
        owner.displayAvatarURL()
      )
      .setThumbnail(bot.user.displayAvatarURL())

    await originalMessage.channel.send(response)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
