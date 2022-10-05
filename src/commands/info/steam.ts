import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType } from 'discord.js'

import { steamToken } from '@deepz/config'
import { createRequest } from '@deepz/helpers'
import { getSteamID } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'
import {
  IGetPlayerSummariesResponse,
  IPlayerBansResponse,
} from '@deepz/types/fetchs/steam'

const states = [
  'Offline',
  'Online',
  'Busy',
  'Away',
  'Snooze',
  'Looking to trade',
  'Looking to play',
]

const steamApiRequest = createRequest({
  baseURL: 'http://api.steampowered.com/ISteamUser',
})

export default new Command({
  name: 'steam',
  aliases: ['stm', 'stem'],
  description: 'Try to get a user steam profile information',
  category: 'INFO',
  options: [
    {
      name: 'id',
      description: 'Steam ID, Steam ID64, Steam ID3 or Custom URL',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  examples: ['d.steam http://steamcommunity.com/id/deepzqueen'],

  run: async ({ args }) => {
    const idToSearch = args.getString('id')

    try {
      const steamId = await getSteamID(idToSearch)

      const summariesBody = await steamApiRequest<IGetPlayerSummariesResponse>({
        url: '/GetPlayerSummaries/v0002/',
        query: {
          key: steamToken,
          steamids: steamId,
        },
      })

      const bansBody = await steamApiRequest<IPlayerBansResponse>({
        url: '/GetPlayerBans/v1/',
        query: {
          key: steamToken,
          steamids: steamId,
        },
      })

      if (!summariesBody.response || bansBody.players?.length === 0)
        return 'I was unable to find a steam profile with that name'

      const playerSummary = summariesBody.response.players[0]
      const playerBans = bansBody.players[0]

      return new CustomMessageEmbed('Steam API', {
        author: {
          name: `Steam Services | ${playerSummary.personaname}`,
          iconURL: playerSummary.avatarfull,
        },
        thumbnail: playerSummary.avatarfull,
        timestamp: true,
        description: stripIndents`
          **Real Name:** ${playerSummary.realname || 'Unknown'}
          **Status:** ${states[playerSummary.personastate]}
          **Country:** :flag_${
            playerSummary.loccountrycode
              ? playerSummary.loccountrycode.toLowerCase()
              : 'white'
          }:
          **Account Created:** ${new Date(
            playerSummary.timecreated * 1000
          ).format('MM/DD/YYYY')}
          **Bans:** Vac: ${playerBans.NumberOfVACBans || '0'}, Game: ${
          playerBans.NumberOfGameBans
        }
          **Link:** [link to profile](${playerSummary.profileurl})
        `,
      })
    } catch (error) {
      logger.error(error)

      if (error instanceof Error) return error.message
      else return `**:x: Something went wrong! Please try again later!**`
    }
  },
})
