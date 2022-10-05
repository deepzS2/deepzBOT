import { ApplicationCommandOptionType, MessagePayload, User } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'avatar',
  description: 'Returns the your current avatar or someone else',
  category: 'SOCIAL',
  options: [
    {
      name: 'user',
      description: 'The user to get avatar',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
})
export default class AvatarCommand extends BaseCommand {
  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
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
  }
}
