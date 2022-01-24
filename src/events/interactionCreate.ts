import {CommandInteractionOptionResolver} from 'discord.js'

import {ExtendedInteraction} from '../@types/command'
import {client} from '../index'
import {Event} from '../structures/Event'

export default new Event('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply()

    const command = client.commands.get(interaction.commandName)

    if (!command)
      return interaction.followUp('You have used a non existent command')

    const response = await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    })

    if (response && typeof response === 'string') interaction.followUp(response)
  }
})
