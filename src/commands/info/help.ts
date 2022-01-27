import {
  BaseApplicationCommandOptionsData,
  MessageActionRow,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js'

import { CommandCategory, CommandType } from '@myTypes'
import { botConfig, categoryEmojis } from '@root/config'
import { capitalizeString, sendMessage } from '@root/functions'
import getArgument from '@root/helpers/arguments'
import logger from '@root/logger'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'help',
  aliases: ['h'],
  category: 'INFO',
  options: [
    {
      name: 'command',
      description: 'A bot command to check the documentation',
      type: 'STRING',
    },
  ],
  description: 'Returns all commands or get the documentation of a command',
  examples: ['d.help greet'],
  slash: 'both',
  run: async ({ client, args, message, interaction }) => {
    const owner = await client.users.fetch(botConfig.ownerId)
    const command = getArgument('string', args, {
      argumentName: 'command',
      index: 0,
    })

    const embed = new CustomMessageEmbed('', {
      author: { name: 'Help Menu', iconURL: client.user.displayAvatarURL() },
      footer: {
        text: `Developer: ${owner.tag}`,
        iconURL: owner.displayAvatarURL(),
      },
    })

    if (command) {
      return client.commands.has(command)
        ? buildHelpMessageForCommand(embed, client.commands.get(command))
        : `**I didn't found any command with that name... Please try \`d.help\` to find all commands you can use.**`
    }

    const authorUsername =
      message?.author.username || interaction?.user.username

    embed.setDescription(`Hello ${authorUsername}, check my commands here:`)

    const panelOptions: MessageSelectOptionData[] = categoryEmojis.map(
      (category) => ({
        label: capitalizeString(category.name),
        value: category.name,
        emoji: category.emoji,
        description: 'Check my commands for ' + category.name.toLowerCase(),
      })
    )

    const panel = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('help_command_category')
        .setPlaceholder('Choose a category for commands')
        .addOptions(panelOptions)
    )

    try {
      const dropdown = await sendMessage(message, interaction, {
        embeds: [embed],
        components: [panel],
        ephemeral: true,
      })

      const collector = dropdown.createMessageComponentCollector({
        filter: (f) => f.isSelectMenu(),
        time: 1000 * 10,
      })

      collector.on('collect', (collected) => {
        if (
          collected.isSelectMenu() &&
          collected.customId === 'help_command_category'
        ) {
          collected.deferUpdate()

          const value = collected.values[0] as CommandCategory
          const cmds = client.commands
            .filter((cmd) => cmd.category === value)
            .map((cmd) => `\`${cmd.name}\``)

          embed.setDescription(
            `Hello ${authorUsername}, check my commands of category \`${capitalizeString(
              value
            )}\` here:\n${cmds.join(' ')}`
          )

          dropdown.edit({ embeds: [embed], components: [panel] })
        }
      })
    } catch (error) {
      logger.error(error)
      return `**Sorry, something went wrong with sending a message...**`
    }
  },
})

function buildHelpMessageForCommand(
  embed: CustomMessageEmbed,
  command: CommandType
): CustomMessageEmbed {
  const { prefix } = botConfig

  embed.setTitle(`${prefix}${command.name}`).setDescription(command.description)

  if (command.options) {
    let optionsUsage = ''
    let options = ''

    command.options.forEach((option) => {
      optionsUsage += (option as BaseApplicationCommandOptionsData).required
        ? ` <${option.name}>`
        : ` [${option.name}]`

      options += `\`${option.name}:\` ${option.description}\n`
    })

    embed
      .addField(
        `***Usage***`,
        `\`${prefix}${command.name}${optionsUsage}\``,
        true
      )
      .addField(`***Options***`, options, true)
  }

  if (command.examples) {
    const examples = command.examples.map((example) => `\`${example}\``)

    embed.addField(`***Examples***`, examples.join('\n'))
  }

  return embed
    .addField(`***Aliases***`, `*__${command.aliases.join(`,\n`)}__*`)
    .setFooter({
      text: '[] = optional, <> = obrigatory',
    })
}
