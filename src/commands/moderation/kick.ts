import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class KickCommand implements Command {
  commandNames = ['kick']
  commandExamples = [
    {
      example: 'd.kick @『 ♥ deepz ♥ 』#4008 ugly...',
      description: 'Kick that guy!!!',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.kick <user> <reason>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}kick to kick someone from the guild.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const kUser = functions.getMember(originalMessage, args.shift())

    if (!kUser || kUser.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**:x: Please provide a valid user to kick!**`
      )

      return
    }

    if (kUser.hasPermission('KICK_MEMBERS')) {
      originalMessage.channel.send(`**:x: The user can't be kicked!**`)

      return
    }

    const kReason = args.join(' ')

    if (!kReason) {
      originalMessage.channel.send(
        `**:x: Please provide a reason for kicking him!**`
      )

      return
    }

    const embed = new MessageEmbed()
      .setDescription(`**Kick**`)
      .setColor('#4360FB')
      .addField(`Kicked user`, `${kUser} with ID ${kUser.id}`)
      .addField(
        `Kicked by`,
        `<@${originalMessage.author.id}> with ID ${originalMessage.author.id}`
      )
      .addField(`Kicked in`, originalMessage.channel)
      .addField(`Time`, originalMessage.createdAt)
      .addField(`Reason`, kReason)

    originalMessage.guild.member(kUser).kick(kReason)

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (!originalMessage.member.hasPermission('KICK_MEMBERS')) {
      return false
    } else {
      return true
    }
  }
}
