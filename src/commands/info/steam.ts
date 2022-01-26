import { stripIndents } from 'common-tags'
import { CommandInteractionOptionResolver } from 'discord.js'
import fetch from 'node-fetch'

import { IGetPlayerSummariesResponse, IPlayerBansResponse } from '@myTypes'
import { steamToken } from '@root/config'
import { formatDate } from '@root/functions'
import getSteamID from '@root/helpers/steam'
import logger from '@root/logger'
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
  options: [
    {
      name: 'id',
      description: 'Steam ID, Steam ID64, Steam ID3 or Custom URL',
      type: 'STRING',
      required: true,
    },
  ],
  slash: 'both',
  run: async ({ args }) => {
    const idToSearch =
      (args as string[])[0] ||
      (args as CommandInteractionOptionResolver).getString('id')

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
