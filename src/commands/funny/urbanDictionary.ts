import { ApplicationCommandOptionType } from 'discord.js'

import { isInteraction, request } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'
import { IGetTermMeanings } from '@deepz/types/fetchs/urbandictionary'

export default new Command({
  name: 'dictionary',
  aliases: ['urban', 'urbandictionary', 'dict', 'urbandict'],
  description: 'Search the meaning of some word!',
  category: 'FUNNY',

  options: [
    {
      name: 'searchterm',
      description: 'Term to search',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  examples: ['d.dictionary hello world'],
  run: async ({ args }) => {
    const searchterm = isInteraction(args)
      ? args.getString('searchterm')
      : args.join(' ')

    try {
      if (!searchterm) return `**:x: I need a term to search...**`

      const { list } = await request<IGetTermMeanings>({
        baseURL: 'https://api.urbandictionary.com/v0',
        url: '/define',
        query: {
          term: searchterm,
        },
      })

      if (!list.length) {
        return `No results found for **${searchterm}**`
      }

      return new CustomMessageEmbed(searchterm, {
        url: list[0].permalink,
        description: `**${list[0].definition}**\n\n**Example:**\n${list[0].example}`,
        footer: {
          text: `Created by ${list[0].author} and written on ${new Date(
            list[0].written_on
          ).format('MM/DD/YYYY')}`,
        },
      })
    } catch (error) {
      logger.error(error)

      return `**:x: Something went wrong! Please try again later...**`
    }
  },
})
