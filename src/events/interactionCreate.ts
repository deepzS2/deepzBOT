import { CommandInteractionOptionResolver, MessageEmbed } from 'discord.js'
import { client } from 'index'

import { ExtendedInteraction } from '@myTypes'
import { Event } from '@structures/Event'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Event('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply()
    const command = client.commands.get(interaction.commandName)

    if (!command) return

    // The response is a string or nothing always so it's easy to handle with slash and message
    const responseMessage = await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    })

    if (!responseMessage) return

    // Embed message
    if (responseMessage instanceof CustomMessageEmbed)
      return interaction.followUp({
        embeds: [responseMessage as MessageEmbed],
      })

    // Simple string message
    if (typeof responseMessage === 'string')
      return interaction.followUp(responseMessage)
  }
})
