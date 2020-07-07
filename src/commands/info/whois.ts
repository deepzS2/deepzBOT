import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class WhoIsCommand implements Command {
  commandCategory = 'Info'
  commandUsage = 'd.whois <user>'
  commandNames = ['whois', 'who', 'user', 'userinfo']
  commandExamples = [
    {
      example: 'd.whois deepz',
      description: 'Return the discord information about deepz',
    },
  ]

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}whois to see the discord information about the user`
  }

  async run({ args, originalMessage }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel.send(`***Please provide an user***`)
      return
    }

    const member = functions.getMember(originalMessage, args.join(' '))

    const joined = functions.formatDate(member.joinedAt)

    const roles =
      member.roles.cache
        .filter((r) => r.id !== originalMessage.guild.id)
        .map((r) => r.name)
        .join(', ') || 'none'

    const created = functions.formatDate(member.user.createdAt)

    const embed = new MessageEmbed()
      .setFooter(member.displayName, member.user.displayAvatarURL())
      .setThumbnail(member.user.displayAvatarURL())
      .setColor('#4360fb')
      .addField(
        'Member information:',
        stripIndents`**>** **Display name:** ${member.displayName}
          **>** **Joined at:** ${joined}
          **>** **Roles:** ${roles}`,
        true
      )
      .addField(
        'User information: ',
        stripIndents`**>** **ID:** ${member.user.id}
          **>** **Username:** ${member.user.username}
          **>** **Discord Tag:** ${member.user.tag}
          **>** **Created at:** ${created}`,
        true
      )
      .setTimestamp()

    if (member.user.presence.activities[0])
      embed.addField(
        'Currentry playing',
        `**>** **Name:** ${member.user.presence.activities[0].name}`
      )

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
