import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'
import querystring from 'querystring'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class UrbanDictionaryCommand implements Command {
  commandNames = ['urban', 'urbandictionary', 'urbandict', 'dict', 'dictionary']
  commandExamples = [
    {
      example: 'd.urban hello world',
      description: 'Search the meaning of the "meme" hello world',
    },
  ]

  commandCategory = 'Funny'

  commandUsage = 'd.urban <term>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}urban to search the meaning of some term.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (args.length === 0) {
      originalMessage.channel.send(`**:x: You need to provide a search term!**`)
    }

    try {
      const query = querystring.stringify({
        term: args.join(' '),
      })

      const { list } = await fetch(
        `https://api.urbandictionary.com/v0/define?${query}`
      ).then((response) => response.json())

      if (!list.length) {
        originalMessage.channel.send(
          `No results found for **${args.join(' ')}**`
        )
      }

      const embed = new MessageEmbed()
        .setTitle(args.join(' '))
        .setURL(list[0].permalink)
        .setDescription(
          `**${list[0].definition}**\n\n**Example:**\n${list[0].example}`
        )

      originalMessage.channel.send(embed)
    } catch (error) {
      console.error(error)
      originalMessage.channel.send(
        `**:x: Something went wrong! Please try again later...**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
