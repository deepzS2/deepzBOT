import { Message, Client } from 'discord.js'
import { readdirSync } from 'fs'

import HelpCommand from '@commands/info/help'
import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import { reactor } from '@reactions/reactor'

/**
 * Command handler
 */
export class CommandHandler {
  /**
   * Array of the commands on the commands folder
   */
  private commands: Command[]

  /**
   * Bot prefix
   */
  private readonly prefix: string

  /**
   * The Client class provided by discord.js
   */
  private readonly bot: Client

  /**
   * Array of categories based on the folders in the /commands
   */
  private readonly categories: Array<string>

  /**
   * @constructor Create a command handler
   * @param prefix Bot prefix
   * @param bot The Client class provided by discord.js
   */
  constructor(prefix: string, bot: Client) {
    const commandClasses = []
    this.categories = []
    let commands: Array<string> = []

    const path =
      process.env.NODE_ENV === 'prod'
        ? './dist/bot/commands'
        : './src/bot/commands'

    readdirSync(path).forEach((dir) => {
      this.categories.push(dir)

      if (process.env.NODE_ENV === 'prod') {
        commands = readdirSync(`${path}/${dir}/`).filter((f) =>
          f.endsWith('.js')
        )
      } else {
        commands = readdirSync(`${path}/${dir}/`).filter((f) =>
          f.endsWith('.ts')
        )
      }

      for (const file of commands) {
        if (file.startsWith('help')) {
          continue
        }

        const pull = require(`../commands/${dir}/${file}`)
        commandClasses.push(pull.default)
      }
    })

    this.commands = commandClasses.map((CommandClass) => new CommandClass())
    this.commands.push(new HelpCommand(this.commands, this.categories))
    this.prefix = prefix
    this.bot = bot
  }

  /**
   * Executes user commands contained in a message if appropriate.
   * @param message Message information
   */
  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !this.isCommand(message)) {
      return
    }

    const commandContext = new CommandContext(message, this.prefix, this.bot)

    const allowedCommands = this.commands.filter((command) =>
      command.hasPermissionToRun(commandContext)
    )
    const matchedCommand = this.commands.find((command) =>
      command.commandNames.includes(commandContext.parsedCommandName)
    )

    if (!matchedCommand) {
      console.log('No matched command')
      reactor.failure(message)
      return
    }

    if (!allowedCommands.includes(matchedCommand)) {
      await message.reply(
        `**:x: You aren't allowed to use that command! Try d.help...**`
      )
      await reactor.failure(message)
    } else {
      await matchedCommand
        .run(commandContext)
        .then(() => {
          reactor.success(message)
        })
        .catch((err) => {
          console.error(err)
          reactor.failure(message)
        })
    }
  }

  /**
   * Determines whether or not a message is a user command.
   * @param message Message information
   */
  private isCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix)
  }
}
