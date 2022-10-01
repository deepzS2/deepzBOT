import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js'

import { isInteraction } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command } from '@deepz/structures'

export default new Command({
  name: 'addrole',
  description: 'Add a role to an user!',
  category: 'MODERATION',
  slash: 'both',
  userPermissions: ['ManageRoles'],
  options: [
    {
      name: 'role',
      description: 'Role to be added',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'user',
      description: 'User to be added the role',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
  ],
  run: async ({ interaction, args, message }) => {
    try {
      if (
        message &&
        !message.member.permissions.has(PermissionFlagsBits.ManageRoles)
      )
        return `You don't have permission to use this command!`

      const role = isInteraction(args)
        ? args.getRole('role')
        : message?.mentions.roles.first()
      const user = isInteraction(args)
        ? (args.getMentionable('user') as GuildMember)
        : message?.mentions.members.first()
      const author = interaction?.user ?? message.author

      if (!role) {
        return `Please provide an role to be added!`
      }

      if (!user || user.id === author.id) {
        return `Please provide an valid user to add the role`
      }

      await user.roles.add(role.id)

      return `**<@${user.id}> now have ${role.name} role!**`
    } catch (error) {
      logger.error(error)

      await (interaction ?? message).channel.send({
        content: `***I could not delete the messages! Try again later...***`,
      })
    }
  },
})
