import { stripIndents } from 'common-tags'

import logger from '@deepz/logger'
import {
  IGetAccountResponse,
  IGetMMRHistoryResponse,
  IGetMMRResponse,
} from '@deepz/types/fetchs/valorant'
import { request } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

/*
  First of all, thanks to HenrikDev for this amazing API!
  Check his profile on github and the API documentation:
  https://docs.henrikdev.xyz/valorant.html
  https://github.com/Henrik-3
*/
const getAccountUrl = (name: string, tag: string) =>
  `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
const getMMRUrl = (name: string, tag: string) =>
  `https://api.henrikdev.xyz/valorant/v1/mmr/na/${name}/${tag}`
const getMMRHistoryUrl = (name: string, tag: string) =>
  `https://api.henrikdev.xyz/valorant/v1/mmr-history/na/${name}/${tag}`

export default new Command({
  name: 'valorant',
  description: 'Gets information about a player in Valorant!',
  options: [
    {
      name: 'username',
      description: 'Username of the player in Valorant',
      type: 'STRING',
      required: true,
    },
    {
      name: 'tagline',
      description: 'Tagline of the player in Valorant',
      type: 'STRING',
      required: true,
    },
  ],
  examples: ['/valorant username:deepzS2 tagline:BR1'],
  category: 'GAMES',
  slash: 'both',
  run: async ({ interaction }) => {
    const name = interaction.options.getString('username')
    const tag = interaction.options.getString('tagline')

    try {
      const accountData = await request<IGetAccountResponse>(
        getAccountUrl(name, tag)
      )

      if (accountData.status === 404) {
        return `***I didn't found any user with that username and tag... Check if it's correct!***`
      }

      const ranked = await request<IGetMMRResponse>(getMMRUrl(name, tag))
      const rankedHistory = await request<IGetMMRHistoryResponse>(
        getMMRHistoryUrl(name, tag)
      )

      const prevMatch = rankedHistory.data[0]

      return new CustomMessageEmbed(accountData.data.name, {
        author: {
          name: `${accountData.data.name}#${
            accountData.data.tag
          } in ${accountData.data.region.toUpperCase()}`,
          iconURL: accountData.data.card.small,
        },
        description: stripIndents`
          Level: ${accountData.data.account_level}
          MMR: ${ranked.data.mmr_change_to_last_game}
          Rank: ${ranked.data.currenttierpatched}
          Elo: ${ranked.data.elo}
          Last ranked match: ${new Date(prevMatch.date).format(
            'MM/DD/YYYY HH:mm:ss'
          )}
        `,
        image: accountData.data.card.wide,
        footer: {
          text: 'Provided by HenrikDev API',
        },
      })
    } catch (error) {
      logger.error(error)

      return `***Something went wrong getting your data! Try again later...***`
    }
  },
})
