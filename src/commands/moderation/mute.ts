import {
  ApplicationCommandOptionType,
  Guild,
  GuildMember,
  MessagePayload,
} from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

const MUTED_ROLE_NAME = 'Muted'

@Command({
  name: 'mute',
  description: 'Mutes an user!',
  category: 'MODERATION',
  userPermissions: ['MuteMembers'],
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
})
export default class MuteCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const user = args.getMentionable('user') as GuildMember
      const time = args.getNumber('time')
      const reason = args.getString('reason')

      if (!user || user.id === interaction.user.id)
        return 'Please provide an user to be muted!'

      if (!time || isNaN(time))
        return 'Please provide an valid time (in minutes) to mute!'

      if (!reason) return 'Please provide an reason for kicking him!'

      const mutedRole = await this.getOrCreateMutedRole(interaction.guild)

      await user.roles.add(mutedRole.id)

      setTimeout(async () => {
        await user.roles.remove(mutedRole.id)

        await interaction.followUp(`<@${user.id}> has been unmuted!`)
      }, time * 60 * 1000)

      const author = interaction.user
      const channel = interaction.channel
      const createdAt = interaction.createdAt

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

      return `***Something went wrong muting this user! Try again later...***`
    }
  }

  private async getOrCreateMutedRole(guild: Guild) {
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
}
