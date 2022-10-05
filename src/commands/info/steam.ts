import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { steamToken } from '@deepz/config'
import { Command } from '@deepz/decorators'
import { createRequest } from '@deepz/helpers'
import { getSteamID } from '@deepz/helpers'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'
import {
  IGetPlayerSummariesResponse,
  IPlayerBansResponse,
} from '@deepz/types/fetchs/steam'

@Command({
  name: 'steam',
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
})
export default class SteamCommand extends BaseCommand {
  private readonly states = [
    'Offline',
    'Online',
    'Busy',
    'Away',
    'Snooze',
    'Looking to trade',
    'Looking to play',
  ]

  private readonly steamApi = createRequest({
    baseURL: 'http://api.steampowered.com/ISteamUser',
  })

  async run({
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const idToSearch = args.getString('id')

    try {
      const steamId = await getSteamID(idToSearch)

      const summariesBody = await this.steamApi<IGetPlayerSummariesResponse>({
        url: '/GetPlayerSummaries/v0002/',
        query: {
          key: steamToken,
          steamids: steamId,
        },
      })

      const bansBody = await this.steamApi<IPlayerBansResponse>({
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
          **Status:** ${this.states[playerSummary.personastate]}
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
  }
}
