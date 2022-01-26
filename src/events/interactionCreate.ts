import { CommandInteractionOptionResolver } from 'discord.js'
import { client } from 'index'

import { ExtendedInteraction } from '@myTypes'
import { Event } from '@structures/Event'

export default new Event('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply()
    const command = client.commands.get(interaction.commandName)

    if (!command) return

    // The response is a string or nothing always so it's easy to handle with slash and message
    const response = await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    })

    if (response && typeof response === 'string') interaction.followUp(response)
  }
})
