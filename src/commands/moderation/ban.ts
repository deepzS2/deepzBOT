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
  name: 'ban',
  description: 'Bans a user from the guild!',
  category: 'MODERATION',
  defaultMemberPermissions: ['BanMembers'],
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
})
export default class BanCommand extends BaseCommand {
  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
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
      this._logger.error(error)

      return `***I could not ban this user! Try again later...***`
    }
  }
}
