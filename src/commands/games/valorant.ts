import { stripIndents } from 'common-tags'
import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { createRequest } from '@deepz/helpers'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'
import {
  IGetAccountResponse,
  IGetMMRHistoryResponse,
  IGetMMRResponse,
} from '@deepz/types/fetchs/valorant'

@Command({
  name: 'valorant',
  category: 'GAMES',
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
})
export default class ValorantCommand extends BaseCommand {
  /*
    First of all, thanks to HenrikDev for this amazing API!
    Check his profile on github and the API documentation:
    https://docs.henrikdev.xyz/valorant.html
    https://github.com/Henrik-3
  */
  private readonly valorantApiRequest = createRequest({
    baseURL: 'https://api.henrikdev.xyz/valorant/v1',
  })

  async run({
    args,
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const subcommand = args.getSubcommand()

      if (subcommand === 'set') {
        const name = args.getString('username')
        const tag = args.getString('tagline')

        const accountData = await this.valorantApiRequest<IGetAccountResponse>({
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
            discordId: interaction.user.id,
          },
        })

        return `***Assigned ${name}#${tag} account to your discord! Try using \`/valorant get\` to get your Valorant data.***`
      }

      const { valorant } = await client.database.user.findUniqueOrThrow({
        where: {
          discordId: interaction.user.id,
        },
      })

      if (!valorant)
        return `***You didn't have assigned your discord to your Valorant account! Try using \`/valorant set\`***`

      const [name, tag] = valorant.split('#')

      const { accountData, ranked, rankedHistory } = await this.fetchData(
        name,
        tag
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

      if (error.message === 'Not found user!') {
        return `***I didn't found any user with that username and tag... Check if it's correct!***`
      }

      return `***Something went wrong getting your data! Try again later...***`
    }
  }

  private async fetchData(name: string, tag: string) {
    const accountData = await this.valorantApiRequest<IGetAccountResponse>({
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

    const ranked = await this.valorantApiRequest<IGetMMRResponse>({
      url: {
        value: '/mmr/na/{name}/{tag}',
        params: {
          name,
          tag,
        },
      },
    })
    const rankedHistory = await this.valorantApiRequest<IGetMMRHistoryResponse>(
      {
        url: {
          value: 'mmr-history/na/{name}/{tag}',
          params: {
            name,
            tag,
          },
        },
      }
    )

    return { accountData, ranked, rankedHistory }
  }
}
