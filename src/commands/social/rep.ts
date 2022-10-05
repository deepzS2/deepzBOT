import { User, ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'rep',
  description: 'Gives a reputation point to someone!',
  category: 'SOCIAL',
  options: [
    {
      name: 'user',
      description: 'User to give reputation',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
})
export default class RepCommand extends BaseCommand {
  async run({
    args,
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user: User = args.getUser('user')

    try {
      if (!user) {
        return `**Please provide a user to give a reputation point...**`
      }

      await client.database.user.update({
        where: {
          discordId: user.id,
        },
        data: {
          reputation: {
            increment: 1,
          },
        },
      })

      return `***<@${interaction.user.id}> just gave a reputation point to <@${user.id}>`
    } catch (error) {
      logger.error(error)

      return `***Error while trying to give reputation point to <@${user.id}>***`
    }
  }
}
