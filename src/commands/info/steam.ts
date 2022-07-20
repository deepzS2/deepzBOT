import { stripIndents } from 'common-tags'
import fetch from 'node-fetch'

import { steamToken } from '@deepz/config'
import logger from '@deepz/logger'
import {
  IGetPlayerSummariesResponse,
  IPlayerBansResponse,
} from '@deepz/types/fetchs/steam'
import { getSteamID } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'
const states = [
  'Offline',
  'Online',
  'Busy',
  'Away',
  'Snooze',
  'Looking to trade',
  'Looking to play',
]

export default new Command({
  name: 'steam',
  aliases: ['stm', 'stem'],
  description: 'Try to get a user steam profile information',
  category: 'INFO',
  options: [
    {
      name: 'id',
      description: 'Steam ID, Steam ID64, Steam ID3 or Custom URL',
      type: 'STRING',
      required: true,
    },
  ],
  examples: ['/steam http://steamcommunity.com/id/deepzqueen'],
  slash: 'both',
  run: async ({ interaction }) => {
    const idToSearch = interaction.options.getString('id')

    const summariesUrl = (id: string) =>
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamToken}&steamids=${id}`

    const bansUrl = (id: string) =>
      `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamToken}&steamids=${id}`

    try {
      const steamId = await getSteamID(idToSearch)

      const summariesBody: IGetPlayerSummariesResponse = await fetch(
        summariesUrl(steamId)
      ).then((res) => res.json())

      const bansBody: IPlayerBansResponse = await fetch(bansUrl(steamId)).then(
        (res) => res.json()
      )

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
