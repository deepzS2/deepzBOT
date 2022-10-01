import { stripIndents } from 'common-tags'
import {
  BaseApplicationCommandOptionsData,
  Collection,
  SelectMenuBuilder,
  SelectMenuComponentOptionData,
  ApplicationCommandOptionType,
  ComponentType,
} from 'discord.js'

import { botConfig, categoryEmojis } from '@deepz/config'
import { isInteraction, sendMessage } from '@deepz/helpers'
import logger from '@deepz/logger'
import { Command, CustomMessageEmbed } from '@deepz/structures'
import { CommandCategory, CommandType } from '@deepz/types/command'

function commandsToString(commands: Collection<string, CommandType>) {
  return commands.map((cmd) => `\`${cmd.name}\``).join(' ')
}

export default new Command({
  name: 'help',
  aliases: ['h'],
  category: 'INFO',
  options: [
    {
      name: 'command',
      description: 'A bot command to check the documentation',
      type: ApplicationCommandOptionType.String,
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

      const cmds = client.commands

      embed.setDescription(
        stripIndents`
          Hello ${authorUsername}, check my commands here: 
          ${commandsToString(cmds)}
        `
      )

      const panelOptions: SelectMenuComponentOptionData[] = categoryEmojis.map(
        (category) => ({
          label: String(category.name).capitalize(),
          value: category.name,
          emoji: category.emoji,
          description: 'Check my commands for ' + category.name.toLowerCase(),
          default: false,
        })
      )

      const selectPanel = new SelectMenuBuilder()
        .setCustomId('help_command_category')
        .setPlaceholder('Choose a category for commands')
        .addOptions(panelOptions)

      const dropdown = await sendMessage({
        message: interaction ?? message,
        content: {
          embeds: [embed],
          components: [
            {
              type: ComponentType.ActionRow,
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

          embed.setDescription(
            stripIndents`
              Hello ${authorUsername}, check my commands of category \`${value.capitalize()}\` here:
              ${commandsToString(cmds.filter((cmd) => cmd.category === value))}
            `
          )

          dropdown.edit({
            embeds: [embed],
            components: [
              {
                type: ComponentType.ActionRow,
                components: [selectPanel],
              },
            ],
          })

          collector.resetTimer()
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
      if (option.type === ApplicationCommandOptionType.Subcommand) {
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
