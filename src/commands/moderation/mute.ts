import {
  ApplicationCommandOptionType,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  PermissionFlagsBits,
} from 'discord.js'

import { isInteraction, sendMessage } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'

const MUTED_ROLE_NAME = 'Muted'

export default new Command({
  name: 'mute',
  description: 'Mutes an user!',
  category: 'MODERATION',
  slash: 'both',
  userPermissions: ['MuteMembers'],
  examples: ['d.mute @user 10 get muted lol'],
  options: [
    {
      name: 'user',
      description: 'User to be muted',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'time',
      description: 'Mute time in minutes',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: 'reason',
      description: 'Mute reason',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ interaction, args, message }) => {
    try {
      if (
        message &&
        !message.member.permissions.has(PermissionFlagsBits.MuteMembers)
      )
        return `You don't have permission to use this command!`

      const user = isInteraction(args)
        ? (args.getMentionable('user') as GuildMember)
        : message.mentions.members.first()
      const time = isInteraction(args)
        ? args.getNumber('time')
        : Number(args[1])
      const reason = isInteraction(args)
        ? args.getString('reason')
        : args.slice(2).join(' ')

      if (!user || user.id === (interaction?.user.id ?? message?.author.id))
        return 'Please provide an user to be muted!'

      if (!time || isNaN(time))
        return 'Please provide an valid time (in minutes) to mute!'

      if (!reason) return 'Please provide an reason for kicking him!'

      const mutedRole = await getOrCreateMutedRole(
        interaction?.guild ?? message.guild
      )

      await user.roles.add(mutedRole.id)

      setTimeout(async () => {
        await user.roles.remove(mutedRole.id)

        await sendMessage({
          content: `<@${user.id}> has been unmuted!`,
          message: interaction ?? message,
        })
      }, time * 60 * 1000)

      const author = interaction?.user ?? message?.author
      const channel =
        interaction?.channel ?? (message?.channel as GuildTextBasedChannel)
      const createdAt = interaction?.createdAt ?? message?.createdAt

      return new CustomMessageEmbed('Mutes', {
        color: '#4360FB',
        fields: [
          {
            name: 'Muted user',
            value: `<@${user.id}> with ID ${user.id}`,
            inline: false,
          },
          {
            name: 'Muted by',
            value: `<@${author.id}> with ID ${author.id}`,
            inline: false,
          },
          {
            name: 'Channel',
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
        content: `***Something went wrong muting this user! Try again later...***`,
      })
    }
  },
})

const getOrCreateMutedRole = async (guild: Guild) => {
  const roleExists = guild.roles.cache.find((r) => r.name === MUTED_ROLE_NAME)

  if (roleExists) return roleExists

  const role = await guild.roles.create({
    name: MUTED_ROLE_NAME,
    color: '#000000',
    permissions: [],
    reason: "Muted role didn't exist",
  })

  await Promise.all(
    guild.channels.cache.map(async (channel) => {
      await channel
        .permissionsFor(role)
        .remove('SendMessages', 'AddReactions', 'Speak')
    })
  )

  return role
}
