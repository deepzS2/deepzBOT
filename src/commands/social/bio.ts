import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

@Command({
  name: 'bio',
  description: 'Sets your profile biography text',
  category: 'SOCIAL',
  options: [
    {
      name: 'text',
      type: ApplicationCommandOptionType.String,
      description: 'The text to your bio',
      required: true,
    },
  ],
})
export default class BioCommand extends BaseCommand {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const bio = args.getString('text')

      if (!bio) return `***Please provide a text...***`

      await this._database.user.update({
        where: {
          discordId: interaction.user.id,
        },
        data: {
          bio,
        },
      })

      return `***Bio changed successfully!***`
    } catch (error) {
      this._logger.error(error)

      return `***There was an error trying to change your bio... Try again later!***`
    }
  }
}
