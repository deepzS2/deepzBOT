import { CommandInteractionOptionResolver, InteractionType } from 'discord.js'

import { client } from '@deepz/index'
import { ExtendedInteraction } from '@deepz/types/command'
import { Event } from '@structures/Event'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Event('interactionCreate', async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    await interaction.deferReply()
    const command = client.commands.get(interaction.commandName)

    if (!command) return

    const responseMessage = await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    })

    if (!responseMessage) return

    // Embed message
    if (responseMessage instanceof CustomMessageEmbed)
      return interaction.followUp({
        embeds: [responseMessage],
      })

    // Simple string message
    if (typeof responseMessage === 'string')
      return interaction.followUp(responseMessage)
  }
})
