import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class ReportCommand implements Command {
  commandNames = ['report']
  commandExamples = [
    {
      example: 'd.report @『 ♥ deepz ♥ 』#4008 ugly...',
      description: 'Reported...',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.report <user> <reason>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}report to report someone from the guild.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const rUser = functions.getMember(originalMessage, args.shift())

    if (!rUser || rUser.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**:x: Please provide a valid user to kick!**`
      )

      return
    }

    const rReason = args.join(' ')

    if (!rReason) {
      originalMessage.channel.send(
        `**:x: Please provide a reason for kicking him!**`
      )

      return
    }

    const embed = new MessageEmbed()
      .setDescription(`**Reports**`)
      .setColor('#4360FB')
      .addField(`Reported user`, `${rUser} with ID ${rUser.id}`)
      .addField(
        `Reported by`,
        `<@${originalMessage.author.id}> with ID ${originalMessage.author.id}`
      )
      .addField(`Channel`, originalMessage.channel)
      .addField(`Time`, originalMessage.createdAt)
      .addField(`Reason`, rReason)

    originalMessage.guild.member(rUser).kick(rReason)

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
