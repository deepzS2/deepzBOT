import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'
import { PrismaClient } from '@prisma/client'

@Command({
  name: 'twitch',
  description: 'Twitch command utility',
  category: 'INFO',
  options: [
    {
      name: 'add',
      description: 'Add a new twitch notification for a twitch user',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'id',
          description: 'Twitch user identifier',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'list',
      description: 'List the twitch notifications for the guild',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'remove',
      description: 'Remove a twitch notification for a twitch user',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'id',
          description: 'Twitch user identifier',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'set',
      description: 'Set a channel to notificate users when someone goes live',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'channel',
          description: 'Discord guild channel',
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
  ],
})
export default class TwitchCommand extends BaseCommand {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const subcommand = args.getSubcommand(true)

    try {
      if (subcommand === 'set') {
        const channel = args.getChannel('channel')

        await this._database.guild.update({
          where: {
            discordId: interaction.guildId,
          },
          data: {
            twitchNotificationChannel: channel.id,
          },
        })

        return `**Twitch notification channel set to <#${channel.id}> channel**`
      }

      const { twitchs, twitchNotificationChannel } =
        await this._database.guild.findUnique({
          where: {
            discordId: interaction.guildId,
          },
          select: {
            twitchs: true,
            twitchNotificationChannel: true,
          },
        })

      if (subcommand === 'list') {
        return stripIndents`
        **Here are the twitchs: ${twitchs.join(', ')}**
        **${
          twitchNotificationChannel
            ? `It'll notify in <#${twitchNotificationChannel}> channel`
            : 'No channel to notify'
        }**`
      }

      const twitchId = args.getString('id')

      await this._database.guild.update({
        where: {
          discordId: interaction.guildId,
        },
        data: {
          twitchs: {
            set:
              subcommand === 'add'
                ? [...twitchs, twitchId]
                : twitchs.filter((value) => value !== twitchId),
          },
        },
      })

      return `**Twitch \`${twitchId}\` ${
        subcommand === 'add' ? 'added' : 'removed'
      }**`
    } catch (error) {
      this._logger.error(error)
    }
  }
}
