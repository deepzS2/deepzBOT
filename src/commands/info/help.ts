import {
  BaseApplicationCommandOptionsData,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js'

import { botConfig, categoryEmojis } from '@deepz/config'
import logger from '@deepz/logger'
import { CommandCategory, CommandType } from '@deepz/types/command'
import { isInteraction, sendMessage } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'help',
  aliases: ['h'],
  category: 'INFO',
  options: [
    {
      name: 'command',
      description: 'A bot command to check the documentation',
      type: 'STRING',
      required: false,
    },
  ],
  description: 'Returns all commands or get the documentation of a command',
  examples: ['d.help play', 'd.help'],
  slash: 'both',
  run: async ({ client, args, message, interaction }) => {
    try {
      const owner = await client.users.fetch(botConfig.ownerId)
      const command = isInteraction(args) ? args.getString('command') : args[0]

      const embed = new CustomMessageEmbed(' ', {
        author: { name: 'Help Menu', iconURL: client.user.displayAvatarURL() },
        footer: {
          text: `Developer: ${owner.tag}`,
          iconURL: owner.displayAvatarURL(),
        },
      })

      if (command) {
        return client.commands.has(command)
          ? buildHelpMessageForCommand(embed, client.commands.get(command))
          : `**I didn't found any command with that name... Please try \`/help\` to find all commands you can use.**`
      }

      const authorUsername =
        message?.author.username || interaction?.user.username

      embed.setDescription(`Hello ${authorUsername}, check my commands here:`)

      const panelOptions: MessageSelectOptionData[] = categoryEmojis.map(
        (category) => ({
          label: String(category.name).capitalize(),
          value: category.name,
          emoji: category.emoji,
          description: 'Check my commands for ' + category.name.toLowerCase(),
          default: false,
        })
      )

      const selectPanel = new MessageSelectMenu()
        .setCustomId('help_command_category')
        .setPlaceholder('Choose a category for commands')
        .addOptions(panelOptions)

      const dropdown = await sendMessage({
        message: interaction ?? message,
        content: {
          embeds: [embed],
          components: [
            {
              type: 'ACTION_ROW',
              components: [selectPanel],
            },
          ],
          ephemeral: true,
        },
      })

      const collector = dropdown.createMessageComponentCollector({
        filter: (f) => f.isSelectMenu(),
        time: 1000 * 10,
      })

      collector.on('collect', async (collected) => {
        if (
          collected.isSelectMenu() &&
          collected.customId === 'help_command_category'
        ) {
          await collected.deferUpdate()

          const value = collected.values[0] as CommandCategory
          const cmds = client.commands
            .filter((cmd) => cmd.category === value)
            .map((cmd) => `\`${cmd.name}\``)

          embed.setDescription(
            `Hello ${authorUsername}, check my commands of category \`${String(
              value
            ).capitalize()}\` here:\n${cmds.join(' ')}`
          )

          dropdown.edit({
            embeds: [embed],
            components: [
              {
                type: 'ACTION_ROW',
                components: [selectPanel],
              },
            ],
          })
        }
      })

      collector.on('end', async () => {
        await dropdown.edit({
          embeds: [embed],
          components: [],
        })
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

    command.options.forEach((option, index) => {
      if (option.type === 'SUB_COMMAND') {
        optionsUsage += ` <${option.name}> ${
          index < command.options.length - 1 ? '|' : ''
        }`
      } else {
        optionsUsage += (option as BaseApplicationCommandOptionsData).required
          ? ` <${option.name}>`
          : ` [${option.name}]`
      }

      options += `\`${option.name}:\` ${option.description}\n`
    })

    embed.addFields([
      {
        name: `***Usage***`,
        value: `\`${prefix}${command.name}${optionsUsage}\``,
        inline: true,
      },
      {
        name: `***Options***`,
        value: options,
        inline: true,
      },
    ])
  }

  if (command.examples) {
    const examples = command.examples.map((example) => `\`${example}\``)

    embed.addFields({
      name: `***Examples***`,
      value: examples.join('\n'),
      inline: false,
    })
  }

  return embed
    .addFields({
      name: `***Aliases***`,
      value: `*__${command.aliases.join(`,\n`)}__*`,
      inline: false,
    })
    .setFooter({
      text: '[] = optional, <> = obrigatory',
    })
}
