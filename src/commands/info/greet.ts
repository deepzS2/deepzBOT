import { MessagePayload } from 'discord.js'

import { botConfig } from '@deepz/config'
import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'greet',
  description: 'Sends you a hello world!',
  category: 'INFO',
})
export default class GreetCommand extends BaseCommand {
  async run({
    client,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const owner = await client.users.fetch(botConfig.ownerId)

    return new CustomMessageEmbed('**Hello World!**', {
      author: {
        name: `Owner: ${owner.tag}`,
        iconURL: owner.displayAvatarURL(),
      },
      thumbnail: client.user.displayAvatarURL(),
    })
  }
}
