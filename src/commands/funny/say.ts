import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class SayCommand implements Command {
  commandNames = ['say', 's', 'speak']
  commandExamples = [
    {
      example: "d.say I'm a robot! Beep Boop! 🤖",
      description: "The bot says he's a robot... Funny tho xd",
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.say <message>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}say to make the bot say something.`
  }

  async run({ originalMessage, bot, args }: CommandContext): Promise<void> {
    if (originalMessage.deletable) originalMessage.delete()

    if (args.length < 1) {
      originalMessage
        .reply('Nothing to say?')
        .then((m) => m.delete({ timeout: 5000 }))
      return
    }

    const roleColor = originalMessage.guild.me.displayHexColor || '#000'

    if (args[0].toLowerCase() === 'embed') {
      const bot_avatar = bot.user.displayAvatarURL()

      const user_avatar = originalMessage.author.displayAvatarURL()

      const embed = new MessageEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(' '))
        .setTimestamp()
        .setImage(bot_avatar)
        .setAuthor(originalMessage.author.username, user_avatar)
        .setFooter(bot.user.username, bot_avatar)

      originalMessage.channel.send(embed)
    } else {
      originalMessage.channel.send(args.join(' '))
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
