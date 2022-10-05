import { ApplicationCommandOptionType, User } from 'discord.js'

import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'avatar',
  description: 'Returns the your current avatar or someone else',
  category: 'SOCIAL',

  examples: ['d.avatar', 'd.avatar @user'],
  options: [
    {
      name: 'user',
      description: 'The user to get avatar',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async ({ interaction, args }) => {
    const user: User = args.getUser('user')
    const author = interaction.user

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
