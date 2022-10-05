import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { request } from '@deepz/helpers'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'
import { IGetTermMeanings } from '@deepz/types/fetchs/urbandictionary'

@Command({
  name: 'dictionary',
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
})
export default class UrbanDictionaryCommand extends BaseCommand {
  async run({
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const searchterm = args.getString('searchterm')

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
  }
}
