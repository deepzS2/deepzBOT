import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class BanCommand implements Command {
  commandNames = ['ban']
  commandExamples = [
    {
      example: 'd.ban @『 ♥ deepz ♥ 』#4008 ugly...',
      description: 'Ban that guy!!!',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.ban <user> <time> <reason>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}ban to ban someone from the guild.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const bUser = functions.getMember(originalMessage, args.shift())

    if (!bUser || bUser.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**:x: Please provide a valid user to ban!**`
      )

      return
    }

    if (bUser.hasPermission('BAN_MEMBERS')) {
      originalMessage.channel.send(`**:x: The user can't be banned!**`)

      return
    }

    const bReason = args.join(' ')

    if (!bReason) {
      originalMessage.channel.send(
        `**:x: Please provide a reason for banning him!**`
      )

      return
    }

    const embed = new MessageEmbed()
      .setDescription(`**Ban**`)
      .setColor('#4360FB')
      .addField(`Banned user`, `${bUser} with ID ${bUser.id}`)
      .addField(
        `Banned by`,
        `<@${originalMessage.author.id}> with ID ${originalMessage.author.id}`
      )
      .addField(`Banned in`, originalMessage.channel)
      .addField(`Time`, originalMessage.createdAt)
      .addField(`Reason`, bReason)

    originalMessage.guild.member(bUser).ban({
      reason: bReason,
    })

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (!originalMessage.member.hasPermission('BAN_MEMBERS')) {
      return false
    } else {
      return true
    }
  }
}
