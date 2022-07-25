import { EmbedFieldData } from 'discord.js'

import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'server',
  aliases: ['sv'],
  description: 'Returns the server information',
  category: 'INFO',
  slash: 'both',
  examples: ['d.server'],
  run: async ({ interaction, message }) => {
    const { guild, member } = interaction || message

    const imageURL = guild.iconURL({
      format: 'png',
    })

    const fields: EmbedFieldData[] = [
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
  },
})
