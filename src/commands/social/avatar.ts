import { ApplicationCommandOptionType, User } from 'discord.js'

import { isInteraction } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'avatar',
  description: 'Returns the your current avatar or someone else',
  category: 'SOCIAL',
  slash: 'both',
  examples: ['d.avatar', 'd.avatar @user'],
  options: [
    {
      name: 'user',
      description: 'The user to get avatar',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async ({ message, interaction, args }) => {
    const user: User = isInteraction(args)
      ? args.getUser('user')
      : message?.mentions.users.first()
    const author = interaction?.user ?? message?.author

    const avatar = (user ?? author).displayAvatarURL({
      size: 2048,
      extension: 'png',
    })

    return new CustomMessageEmbed(`**${(user ?? author).username}**`, {
      image: avatar,
      description: `**Click [here](${avatar}) to get the image!**`,
    })
  },
})