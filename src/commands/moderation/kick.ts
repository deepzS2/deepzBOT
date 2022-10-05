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
        return `**Please provide a reason to kick this user!**`
      }

      if (!user || user.id === author.id) {
        return `**Please provide a valid user to kick and it can't be yourself!**`
      }

      const channel =
        interaction?.channel ?? (message?.channel as GuildTextBasedChannel)
      const createdAt = interaction?.createdAt ?? message?.createdAt

      await (interaction?.guild ?? message.guild).members.kick(user, reason)

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
