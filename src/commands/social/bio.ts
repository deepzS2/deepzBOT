import { ApplicationCommandOptionType, MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

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
  async run({
    args,
    interaction,
    client,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const bio = args.getString('text')

      if (!bio) return `***Please provide a text...***`

      await client.database.user.update({
        where: {
          discordId: interaction.user.id,
        },
        data: {
          bio,
        },
      })

      return `***Bio changed successfully!***`
    } catch (error) {
      logger.error(error)

      return `***There was an error trying to change your bio... Try again later!***`
    }
  }
}
