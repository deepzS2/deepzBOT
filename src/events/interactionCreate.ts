import { CommandInteractionOptionResolver } from 'discord.js'

import logger from '@deepz/logger'
import { ExtendedInteraction } from '@deepz/types/command'
import { Event, CustomMessageEmbed } from '@structures'

export default new Event('interactionCreate', async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
      await interaction.deferReply()

      // Ensure that the user exists in database by when updating if does not exists create the user or just update
      await client.database.user.upsert({
        where: {
          discordId: interaction.user.id,
        },
        create: {
          discordId: interaction.user.id,
          username: interaction.user.username,
        },
        update: {
          experience: {
            increment: Math.floor(Math.random() * 15) + 10,
          },
          balance: {
            increment: Math.floor(Math.random() * 7) + 3,
          },
        },
      })

      const responseMessage = await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
      })

      if (!responseMessage) return

      // Embed message
      if (responseMessage instanceof CustomMessageEmbed)
        return await interaction.editReply({
          embeds: [responseMessage],
        })

      // Simple string message
      if (typeof responseMessage === 'string')
        return await interaction.editReply(responseMessage)
    } catch (error) {
      logger.error(error, 'Error with ' + command.name + ' command')
    }
  }
})
