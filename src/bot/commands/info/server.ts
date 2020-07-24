import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class ServerCommand implements Command {
  commandNames = ['server', 'sv']
  commandExamples = [
    {
      example: 'd.server',
      description: 'Returns current server information',
    },
  ]

  commandCategory = 'Info'

  commandUsage = 'd.server'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}server to get current server information.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const sicon = originalMessage.guild.iconURL({
      format: 'png',
    })

    const response = new MessageEmbed()
      .setDescription('Server Information')
      .setColor('#4360fb')
      .setThumbnail(sicon)
      .addField('Server Name', originalMessage.guild.name)
      .addField('Created On', originalMessage.guild.createdAt)
      .addField('You Joined', originalMessage.member.joinedAt)
      .addField('Total Members', originalMessage.guild.memberCount)

    await originalMessage.channel.send(response)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
