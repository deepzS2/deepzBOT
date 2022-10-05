import {
  ApplicationCommandOptionType,
  GuildMember,
  GuildTextBasedChannel,
  PermissionFlagsBits,
} from 'discord.js'

import { isInteraction } from '@deepz/helpers'
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
  run: async ({ interaction, args, message }) => {
    try {
      if (
        message &&
        !message.member.permissions.has(PermissionFlagsBits.KickMembers)
      )
        return `You don't have permission to use this command!`

      const user = isInteraction(args)
        ? (args.getMentionable('user') as GuildMember)
        : message.mentions.members.first()
      const reason = isInteraction(args)
        ? args.getString('reason')
        : args.splice(1).join('')
      const author = interaction?.user ?? message?.author

      if (!reason) {
        return `**Please provide a reason to ban this user!**`
      }

      if (!user || user.id === author.id) {
        return `**Please provide a valid user to ban and it can't be yourself!**`
      }

      const channel =
        interaction?.channel ?? (message?.channel as GuildTextBasedChannel)
      const createdAt = interaction?.createdAt ?? message?.createdAt

      await (interaction?.guild ?? message.guild).members.ban(user, {
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

      await (interaction ?? message).channel.send({
        content: `***I could not kick this user! Try again later...***`,
      })
    }
  },
})
