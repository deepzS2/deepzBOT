import { stripIndents } from 'common-tags'
import { EmbedFieldData, GuildMember } from 'discord.js'

import { formatDate } from '@root/functions'
import getArgument from '@root/helpers/arguments'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'whois',
  aliases: ['who', 'whis'],
  description: 'Returns a mentioned user information',
  category: 'INFO',
  options: [
    {
      name: 'user',
      description: 'The target user',
      type: 'MENTIONABLE',
      required: true,
    },
  ],
  examples: ['d.whois @user'],
  slash: 'both',
  run: async ({ message, args, interaction }) => {
    const member = getArgument('mention', args, {
      message,
      argumentName: 'user',
    })

    const guild = message?.guild || interaction?.guild

    if (!member || !(member instanceof GuildMember) || !guild) return

    const joined = formatDate(member.joinedAt)
    const created = formatDate(member.user.createdAt)

    const roles =
      member.roles.cache
        .filter((r) => r.id !== guild.id)
        .map((r) => r.name)
        .join(', ') || 'none'

    const embedFields: EmbedFieldData[] = [
      {
        name: 'Member Information',
        value: stripIndents`
        **>** **Display name:** ${member.displayName}
        **>** **Joined at:** ${joined}
        **>** **Roles:** ${roles}
      `,
      },
      {
        name: 'User Information',
        value: stripIndents`
        **>** **ID:** ${member.user.id}
        **>** **Username:** ${member.user.username}
        **>** **Discord Tag:** ${member.user.tag}
        **>** **Created at:** ${created}
      `,
      },
    ]

    if (member.presence?.activities[0]) {
      embedFields.push({
        name: 'Currently playing',
        value: `**>** **Name:** ${member.presence.activities[0].name}`,
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
  },
})
