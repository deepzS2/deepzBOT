import { stripIndents } from 'common-tags'
import {
  ApplicationCommandOptionType,
  EmbedField,
  GuildMember,
} from 'discord.js'

import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'whois',
  aliases: ['who', 'whis'],
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
  examples: ['d.whois @user'],

  run: async ({ args, interaction }) => {
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
  },
})
