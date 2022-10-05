import { stripIndents } from 'common-tags'
import {
  ApplicationCommandOptionType,
  EmbedField,
  GuildMember,
  MessagePayload,
} from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'whois',
  description: 'Returns a mentioned user information',
  category: 'INFO',
  options: [
    {
      name: 'user',
      description: 'The target user',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
  ],
})
export default class WhoIsCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const member = args.getMentionable('user')

    const { guild } = interaction

    if (!member || !(member instanceof GuildMember) || !guild) return

    const joined = member.joinedAt.format('MM/DD/YYYY')
    const created = member.user.createdAt.format('MM/DD/YYYY')

    const roles =
      member.roles.cache
        .filter((r) => r.id !== guild.id)
        .map((r) => r.name)
        .join(', ') || 'none'

    const embedFields: EmbedField[] = [
      {
        name: 'Member Information',
        value: stripIndents`
        **>** **Display name:** ${member.displayName}
        **>** **Joined at:** ${joined}
        **>** **Roles:** ${roles}
      `,
        inline: false,
      },
      {
        name: 'User Information',
        value: stripIndents`
        **>** **ID:** ${member.user.id}
        **>** **Username:** ${member.user.username}
        **>** **Discord Tag:** ${member.user.tag}
        **>** **Created at:** ${created}
      `,
        inline: false,
      },
    ]

    if (member.presence?.activities[0]) {
      embedFields.push({
        name: 'Currently playing',
        value: `**>** **Name:** ${member.presence.activities[0].name}`,
        inline: false,
      })
    }

    return new CustomMessageEmbed('Who Is?', {
      thumbnail: member.user.displayAvatarURL(),
      footer: {
        text: member.displayName,
        iconURL: member.user.displayAvatarURL(),
      },
      timestamp: true,
      fields: embedFields,
    })
  }
}
