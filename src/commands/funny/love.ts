import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class LoveCommand implements Command {
  commandNames = ['love', 'affinity', 'lv']
  commandExamples = [
    {
      example: 'd.love @『 ♥ deepz ♥ 』#4008',
      description: 'Calculate your love affinity with deepz 🥰',
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.goodmorning <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}love to calculate the love affinity you have for another person 💘.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    let person = functions.getMember(originalMessage, args[0])

    const love = Math.random() * 100

    if (!person || originalMessage.author.id === person.id) {
      person = originalMessage.guild.members.cache
        .filter((m) => m.id !== originalMessage.author.id)
        .random()
    }

    const loveIndex = Math.floor(love / 10)
    const loveLevel = '💖'.repeat(loveIndex) + '💔'.repeat(10 - loveIndex)

    const embed = new MessageEmbed()
      .setColor('#4360fb')
      .addField(
        `☁ **${person.displayName}** loves **${originalMessage.member.displayName}** this much:`,
        `💟 ${Math.floor(love)}%\n\n${loveLevel}`
      )
      .setThumbnail(person.user.displayAvatarURL())

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
