import { EmbedField, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'server',
  description: 'Returns the server information',
  category: 'INFO',
})
export default class ServerCommand extends BaseCommand {
  async run({
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const { guild, member } = interaction

    const imageURL = guild.iconURL({
      extension: 'png',
    })

    const fields: EmbedField[] = [
      {
        name: 'Created on',
        value: guild.createdAt.toLocaleDateString(),
        inline: false,
      },
      {
        name: 'You joined at',
        value: member.joinedAt.toLocaleDateString(),
        inline: false,
      },
      {
        name: 'Total members',
        value: guild.memberCount.toString(),
        inline: false,
      },
    ]

    return new CustomMessageEmbed(guild.name, {
      description: 'Server Information',
      thumbnail: imageURL,
      fields,
    })
  }
}
