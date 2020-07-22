import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class AvatarCommand implements Command {
  commandNames = ['avatar', 'pfp', 'profilepicture']
  commandExamples = [
    {
      example: 'd.avatar',
      description: 'Am I cute? :flushed:',
    },
    {
      example: 'd.avatar @『 ♥ deepz ♥ 』#4008',
      description: 'Pretty tho :flushed:',
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.avatar [user]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}avatar to see the current profile picture of someone.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      const avatar = originalMessage.author.displayAvatarURL({
        size: 2048,
        dynamic: true,
      })

      const embed = new MessageEmbed()
        .setTitle(`**${originalMessage.author.username}**`)
        .setImage(avatar)
        .setDescription(`**Click [here](${avatar}) to get the image!**`)

      originalMessage.channel.send(embed)
    } else if (args[0]) {
      const user = functions.getMember(originalMessage, args[0]).user

      const avatar = user.displayAvatarURL({
        size: 2048,
        dynamic: true,
      })

      const embed = new MessageEmbed()
        .setTitle(`**${user.username}**`)
        .setImage(avatar)
        .setDescription(`**Click [here](${avatar}) to get the image!**`)

      originalMessage.channel.send(embed)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
