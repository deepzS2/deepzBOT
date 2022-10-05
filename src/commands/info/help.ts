import { stripIndents } from 'common-tags'
import {
  BaseApplicationCommandOptionsData,
  SelectMenuBuilder,
  SelectMenuComponentOptionData,
  ApplicationCommandOptionType,
  ComponentType,
  MessagePayload,
  Collection,
} from 'discord.js'

import { botConfig, categoryEmojis } from '@deepz/config'
import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { CommandCategory, ICommandData, RunOptions } from '@deepz/types/command'

@Command({
  name: 'help',
  description: 'Returns all commands or get the documentation of a command',
  category: 'INFO',
  options: [
    {
      name: 'command',
      description: 'A bot command to check the documentation',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
})
export default class HelpCommand extends BaseCommand {
  async run({
    client,
    args,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    try {
      const owner = await client.users.fetch(botConfig.ownerId)
      const command = args.getString('command')

      const embed = new CustomMessageEmbed(' ', {
        author: { name: 'Help Menu', iconURL: client.user.displayAvatarURL() },
        footer: {
          text: `Developer: ${owner.tag}`,
          iconURL: owner.displayAvatarURL(),
        },
      })

      if (command) {
        return client.commands.has(command)
          ? this.buildHelpMessageForCommand(embed, client.commands.get(command))
          : `**I didn't found any command with that name... Please try \`/help\` to find all commands you can use.**`
      }

      const authorUsername = interaction.user.username

      const cmds = client.commands

      embed.setDescription(
        stripIndents`
          Hello ${authorUsername}, check my commands here: 
          ${this.commandsToString(cmds)}
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

      const dropdown = await interaction.followUp({
        embeds: [embed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [selectPanel],
          },
        ],
        ephemeral: true,
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

          const categoryCommands = client.commands.filter((cmd) => {
            const { category } = cmd.options

            return category === value
          })

          embed.setDescription(
            stripIndents`
              Hello ${authorUsername}, check my commands of category \`${value.capitalize()}\` here:
              ${this.commandsToString(categoryCommands)}
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
  }

  private buildHelpMessageForCommand(
    embed: CustomMessageEmbed,
    command: ICommandData
  ): CustomMessageEmbed {
    const commandOptions = command.options

    embed
      .setTitle(`/${commandOptions.name}`)
      .setDescription(commandOptions.description)

    if (commandOptions.options) {
      let optionsUsage = ''
      let options = ''

      commandOptions.options.forEach((option, index) => {
        if (option.type === ApplicationCommandOptionType.Subcommand) {
          optionsUsage += ` <${option.name}> ${
            index < commandOptions.options.length - 1 ? '|' : ''
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
          value: `\`/${commandOptions.name}${optionsUsage}\``,
          inline: true,
        },
        {
          name: `***Options***`,
          value: options,
          inline: true,
        },
      ])
    }

    return embed.setFooter({
      text: '[] = optional, <> = obrigatory',
    })
  }

  private commandsToString(commands: Collection<string, ICommandData>) {
    return commands.map((cmd) => `\`${cmd.options.name}\``).join(' ')
  }
}
