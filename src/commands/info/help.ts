import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import emojis from '@models/emojis'

export default class HelpCommand implements Command {
  readonly commandNames = ['help', 'halp', 'hlep']
  readonly commandExamples = [
    {
      example: 'd.help',
      description: 'Return all commands',
    },
    {
      example: 'd.help greet',
      description: 'Return command usages, aliases, etc.',
    },
  ]

  commandCategory = 'Info'
  commandUsage = 'd.help [command]'

  private commands: Command[]
  private categories: Array<string>

  constructor(commands: Command[], categories: Array<string>) {
    this.commands = commands
    this.categories = categories
  }

  async run(commandContext: CommandContext): Promise<void> {
    const owner = await commandContext.bot.users.fetch('411557789068951552')

    const embed = new MessageEmbed()
      .setAuthor(`Help Menu`, commandContext.bot.user.displayAvatarURL())
      .setColor('#4360FB')

    const allowedCommands = this.commands.filter((command) =>
      command.hasPermissionToRun(commandContext)
    )

    const commands = (category) => {
      return this.commands
        .filter((cmd) => cmd.commandCategory.toLowerCase() === category)
        .map((cmd) => `\`${cmd.commandNames[0]}\``)
        .join(' ')
    }

    if (commandContext.args.length === 0) {
      // No command specified, give the user a list of all commands they can use.
      this.categories.forEach((cat) => {
        const emoji = emojis.find((value) => value.name === cat).emoji

        embed
          .addField(
            `${emoji} ${cat[0].toUpperCase() + cat.slice(1)}`,
            `${commands(cat)}.`,
            true
          )
          .setFooter(
            `Developer: ${owner.username}#${owner.discriminator}`,
            owner.displayAvatarURL()
          )
      })

      await commandContext.originalMessage.channel.send(embed)
      return
    }

    const matchedCommand = this.commands.find((command) =>
      command.commandNames.includes(commandContext.args[0])
    )
    if (!matchedCommand) {
      await commandContext.originalMessage.channel.send(
        embed.setDescription(
          "I don't know about that command :(. Try d.help to find all commands you can use."
        )
      )
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Unrecognized command')
    } else if (allowedCommands.includes(matchedCommand)) {
      await commandContext.originalMessage.channel.send(
        this.buildHelpMessageForCommand(matchedCommand, commandContext)
      )
    }
  }

  private buildHelpMessageForCommand(
    command: Command,
    context: CommandContext
  ): MessageEmbed {
    const examples = command.commandExamples.map((value) => {
      return `\`${value.example}\`\n${value.description}`
    })

    const embed = new MessageEmbed()
      .setAuthor('Help Menu', context.bot.user.displayAvatarURL())
      .setColor('#4360FB')
      .setTitle(`d.${command.commandNames[0]}`)
      .setDescription(command.getHelpMessage(context.commandPrefix))
      .addField(`***Examples***`, examples, true)
      .addField(`***Usage***`, `\`${command.commandUsage}\``, true)
      .addField(`***Aliases***`, `*__${command.commandNames.join(`,\n`)}__*`)
      .setFooter('[] = optional, <> = obrigatory')

    return embed
  }

  hasPermissionToRun(): boolean {
    return true
  }

  getHelpMessage(): string {
    return 'I think you already know how to use this command...'
  }
}
