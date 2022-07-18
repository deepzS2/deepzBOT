import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType } from 'discord.js'
import fetch from 'node-fetch'

import { steamToken } from '@deepz/config'
import { formatDate } from '@deepz/functions'
import logger from '@deepz/logger'
import {
  IGetPlayerSummariesResponse,
  IPlayerBansResponse,
} from '@deepz/types/fetchs/steam'
import getArgument from '@helpers/arguments'
import getSteamID from '@helpers/steam'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

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
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  examples: ['d.steam http://steamcommunity.com/id/deepzqueen'],
  slash: 'both',
  run: async ({ args }) => {
    const idToSearch = getArgument('string', args, {
      argumentName: 'id',
      index: 0,
    })

    if (!idToSearch) return

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
          **Account Created:** ${formatDate(
            new Date(playerSummary.timecreated * 1000)
          )}
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
