import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType } from 'discord.js'

import { isInteraction, request } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'
import {
  IGetAccountResponse,
  IGetMMRHistoryResponse,
  IGetMMRResponse,
} from '@deepz/types/fetchs/valorant'

/*
  First of all, thanks to HenrikDev for this amazing API!
  Check his profile on github and the API documentation:
  https://docs.henrikdev.xyz/valorant.html
  https://github.com/Henrik-3
*/
const baseURL = 'https://api.henrikdev.xyz/valorant/v1'

export default new Command({
  name: 'valorant',
  aliases: ['vava', 'valo', 'va'],
  description:
    'Gets your Valorant account info assigning your discord to your Valorant account!',
  options: [
    {
      name: 'set',
      description: 'Assign your discord account to Valorant!',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'username',
          description: 'Username of the player in Valorant',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'tagline',
          description: 'Tagline of the player in Valorant',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'get',
      description: 'Get your Valorant account details',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  examples: ['d.valorant set deepzS2 BR1', 'd.valorant get'],
  category: 'GAMES',
  slash: 'both',
  run: async ({ interaction, client, args, message }) => {
    try {
      const subcommand = isInteraction(args) ? args.getSubcommand() : args[0]

      if (subcommand === 'set') {
        const name = isInteraction(args) ? args.getString('username') : args[1]
        const tag = isInteraction(args) ? args.getString('tagline') : args[2]

        const accountData = await request<IGetAccountResponse>({
          baseURL,
          url: {
            value: '/account/{name}/{tag}',
            params: {
              name,
              tag,
            },
          },
        })

        if (accountData.status === 404) {
          return `***I didn't found any user with that username and tag... Check if it's correct!***`
        }

        await client.database.user.update({
          data: {
            valorant: `${name}#${tag}`,
          },
          where: {
            discordId: interaction?.user.id || message?.author.id,
          },
        })

        return `***Assigned ${name}#${tag} account to your discord! Try using \`/valorant get\` to get your Valorant data.***`
      }

      const { valorant } = await client.database.user.findUniqueOrThrow({
        where: {
          discordId: interaction?.user.id || message?.author.id,
        },
      })

      if (!valorant)
        return `***You didn't have assigned your discord to your Valorant account! Try using \`/valorant set\`***`

      const [name, tag] = valorant.split('#')

      const { accountData, ranked, rankedHistory } = await fetchData(name, tag)

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

      if (error.message === 'Not found user!') {
        return `***I didn't found any user with that username and tag... Check if it's correct!***`
      }

      return `***Something went wrong getting your data! Try again later...***`
    }
  },
})

async function fetchData(name: string, tag: string) {
  const accountData = await request<IGetAccountResponse>({
    baseURL,
    url: {
      value: '/account/{name}/{tag}',
      params: {
        name,
        tag,
      },
    },
  })

  if (accountData.status === 404) {
    throw new Error('Not found user!')
  }

  const ranked = await request<IGetMMRResponse>({
    baseURL,
    url: {
      value: '/mmr/na/{name}/{tag}',
      params: {
        name,
        tag,
      },
    },
  })
  const rankedHistory = await request<IGetMMRHistoryResponse>({
    baseURL,
    url: {
      value: 'mmr-history/na/{name}/{tag}',
      params: {
        name,
        tag,
      },
    },
  })

  return { accountData, ranked, rankedHistory }
}
