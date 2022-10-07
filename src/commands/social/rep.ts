import { User, ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

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
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const user: User = args.getUser('user')

    try {
      if (!user) {
        return `**Please provide a user to give a reputation point...**`
      }

      await this._database.user.update({
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
      this._logger.error(error)

      return `***Error while trying to give reputation point to <@${user.id}>***`
    }
  }
}
