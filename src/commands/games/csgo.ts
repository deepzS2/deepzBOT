import axios from 'axios'
import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType } from 'discord.js'

import logger from '@deepz/logger'
import {
  ICsUserDataResponse,
  ISearchSteamUserResponse,
} from '@deepz/types/fetchs/csgo'
import { isInteraction } from '@helpers'
import { tracker } from '@services'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'csgo',
  description:
    'Gets the Counter-Strike: Global Offensive information by the steam of the user!',
  category: 'GAMES',
  slash: 'both',
  options: [
    {
      name: 'steam',
      description: 'Steam URL, Steam Vanity URL or Steam ID',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  examples: ['d.steam deepzqueen'],
  run: async ({ args }) => {
    try {
      const steam = isInteraction(args) ? args.getString('steam') : args[0]

      if (!steam)
        return `Please provide me a Steam ID, Steam community URL, or a Steam vanity username.`

      const { data: steamUser } = await tracker.get<ISearchSteamUserResponse>(
        `/csgo/standard/search?query=${steam}&platform=steam`
      )

      const { data: csgoUser } = await tracker.get<ICsUserDataResponse>(
        `/csgo/standard/profile/steam/${steamUser.data[0].platformUserId}`
      )

      return new CustomMessageEmbed(steamUser.data[0].platformUserHandle, {
        author: {
          name: 'Counter-Strike: Global Offensive',
          iconURL:
            'https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png',
        },
        thumbnail: steamUser.data[0].avatarUrl,
        color: '#4360FB',
        description: stripIndents`
          -> **Kills:** ${csgoUser.data.segments[0].stats.kills.displayValue}
          -> **Deaths:** ${csgoUser.data.segments[0].stats.deaths.displayValue}
          -> **%Headshot:** ${csgoUser.data.segments[0].stats.headshotPct.displayValue}
          -> **K/D:** ${csgoUser.data.segments[0].stats.kd.displayValue}
          -> **Accuracy:** ${csgoUser.data.segments[0].stats.shotsAccuracy.displayValue}
          -> **Score:** ${csgoUser.data.segments[0].stats.score.displayValue}
          -> **Time played:** ${csgoUser.data.segments[0].stats.timePlayed.displayValue}
          -> **Wins:** ${csgoUser.data.segments[0].stats.wins.displayValue}
          -> **Losses:** ${csgoUser.data.segments[0].stats.losses.displayValue}
          -> **%Win:** ${csgoUser.data.segments[0].stats.wlPercentage.displayValue}
        `,
      }).setFooter({
        text: `Next update: ${new Date(csgoUser.data.expiryDate).format(
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
  },
})
