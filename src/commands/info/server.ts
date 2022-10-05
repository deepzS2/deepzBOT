import { EmbedField } from 'discord.js'

import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'server',
  aliases: ['sv'],
  description: 'Returns the server information',
  category: 'INFO',

  examples: ['d.server'],
  run: async ({ interaction }) => {
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
  },
})
