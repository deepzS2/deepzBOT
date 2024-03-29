import {
  ApplicationCommandOptionType,
  GuildMember,
  MessagePayload,
  PermissionFlagsBits,
} from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'addrole',
  description: 'Add a role to an user!',
  category: 'MODERATION',
  defaultMemberPermissions: ['ManageRoles'],
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
})
export default class AddRoleCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const role = args.getRole('role')
      const user = args.getMentionable('user') as GuildMember
      const author = interaction.user
      const bot = interaction.guild.members.me

      if (!bot.permissions.has(PermissionFlagsBits.ManageRoles))
        return `I don't have permission to manage roles on this server...`

      if (!role) {
        return `Please provide an role to be added...`
      }

      if (!user || user.id === author.id) {
        return `Please provide an valid user to add the role...`
      }

      await user.roles.add(role.id)

      return `***<@${user.id}> now have ${role.name} role!***`
    } catch (error) {
      this._logger.error(error)

      return `***I could not add role! Try again later...***`
    }
  }
}
