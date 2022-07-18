import { EmbedFieldData } from 'discord.js'

import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'server',
  aliases: ['sv'],
  description: 'Returns the server information',
  category: 'INFO',
  slash: 'both',
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
