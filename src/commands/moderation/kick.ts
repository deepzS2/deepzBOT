import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js'

import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'kick',
  description: 'Kick an user from the guild!',
  category: 'MODERATION',

  userPermissions: ['KickMembers'],
  examples: ['d.kick @user get kicked lol'],
  options: [
    {
      name: 'user',
      description: 'User to be kicked',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason of the kick',
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

      if (!bot.permissions.has(PermissionFlagsBits.KickMembers))
        return `I don't have permission to kick members on this server...`

      if (!reason) {
        return `**Please provide a reason to kick this user!**`
      }

      if (!user || user.id === author.id) {
        return `**Please provide a valid user to kick and it can't be yourself!**`
      }

      const channel = interaction.channel
      const createdAt = interaction.createdAt

      await interaction.guild.members.kick(user, reason)

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

      return `***I could not kick this user! Try again later...***`
    }
  },
})
