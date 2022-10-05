import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js'

import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'ban',
  description: 'Bans a user from the guild!',
  category: 'MODERATION',

  userPermissions: ['BanMembers'],
  examples: ['d.ban @user get banned lol'],
  options: [
    {
      name: 'user',
      description: 'User to be banned',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason of the ban',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ interaction, args }) => {
    try {
      const user = args.getMentionable('user') as GuildMember
      const reason = args.getString('reason')
      const author = interaction.user
      const bot = interaction.guild.members.me

      if (!bot.permissions.has(PermissionFlagsBits.BanMembers))
        return `I don't have permission to ban members on this server...`

      if (!reason) {
        return `**Please provide a reason to ban this user!**`
      }

      if (!user || user.id === author.id) {
        return `**Please provide a valid user to ban and it can't be yourself!**`
      }

      const channel = interaction.channel
      const createdAt = interaction.createdAt

      await interaction.guild.members.ban(user, {
        reason,
      })

      return new CustomMessageEmbed(' ', {
        description: '**Kick**',
        color: '#4360FB',
        fields: [
          {
            name: 'Kicked user',
            value: `<@${user.id}> with ID ${user.id}`,
            inline: false,
          },
          {
            name: 'Kicked by',
            value: `<@${author.id}> with ID ${author.id}`,
            inline: false,
          },
          {
            name: 'Kicked in',
            value: channel.name,
            inline: false,
          },
          {
            name: 'Time',
            value: createdAt.format('HH:mm:ss MM/DD/YYYY'),
            inline: false,
          },
          {
            name: 'Reason',
            value: reason,
            inline: false,
          },
        ],
      })
    } catch (error) {
      logger.error(error)

      return `***I could not ban this user! Try again later...***`
    }
  },
})
