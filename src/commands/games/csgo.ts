import axios from 'axios'
import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { tracker } from '@deepz/services'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'
import {
  ICsUserDataResponse,
  ISearchSteamUserResponse,
} from '@deepz/types/fetchs/csgo'

@Command({
  name: 'csgo',
  description:
    'Gets the Counter-Strike: Global Offensive information by the steam of the user!',
  category: 'GAMES',
  options: [
    {
      name: 'steam',
      description: 'Steam URL, Steam Vanity URL or Steam ID',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
})
export default class CsgoCommand extends BaseCommand {
  async run({
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const steam = args.getString('steam')

      if (!steam)
        return `Please provide me a Steam ID, Steam community URL, or a Steam vanity username.`

      const { data: steamUser } = await tracker<ISearchSteamUserResponse>({
        url: '/csgo/standard/search',
        query: {
          query: steam,
          platform: 'steam',
        },
      })

      const { data: csgoUser } = await tracker<ICsUserDataResponse>({
        url: {
          value: '/csgo/standard/profile/steam/{userId}',
          params: {
            userId: steamUser[0].platformUserId,
          },
        },
      })

      return new CustomMessageEmbed(steamUser[0].platformUserHandle, {
        author: {
          name: 'Counter-Strike: Global Offensive',
          iconURL:
            'https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png',
        },
        thumbnail: steamUser[0].avatarUrl,
        color: '#4360FB',
        description: stripIndents`
          -> **Kills:** ${csgoUser.segments[0].stats.kills.displayValue}
          -> **Deaths:** ${csgoUser.segments[0].stats.deaths.displayValue}
          -> **%Headshot:** ${csgoUser.segments[0].stats.headshotPct.displayValue}
          -> **K/D:** ${csgoUser.segments[0].stats.kd.displayValue}
          -> **Accuracy:** ${csgoUser.segments[0].stats.shotsAccuracy.displayValue}
          -> **Score:** ${csgoUser.segments[0].stats.score.displayValue}
          -> **Time played:** ${csgoUser.segments[0].stats.timePlayed.displayValue}
          -> **Wins:** ${csgoUser.segments[0].stats.wins.displayValue}
          -> **Losses:** ${csgoUser.segments[0].stats.losses.displayValue}
          -> **%Win:** ${csgoUser.segments[0].stats.wlPercentage.displayValue}
        `,
      }).setFooter({
        text: `Next update: ${new Date(csgoUser.expiryDate).format(
          'HH:mm:ss MM/DD/YYYY'
        )}`,
      })
    } catch (error) {
      logger.error(error)

      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 500)
          return 'Something went wrong with the tracker server API! Please try again later'
        if (error?.response?.status === 404) return 'Player not found!'
        if (
          (error?.response?.data as any).errors[0].code ===
          'CollectorResultStatus::Private'
        )
          return 'Private profile :flushed:'
      }

      return 'Something went wrong! Please try again later'
    }
  }
}
