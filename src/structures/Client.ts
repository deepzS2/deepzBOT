import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  Intents,
} from 'discord.js'
import glob from 'glob'
import path from 'path'
import { promisify } from 'util'

import {
  RegisterCommandsOptions,
  CommandType,
  BotConfiguration,
} from '@myTypes'
import { botConfig } from '@root/config'
import logger from '@root/logger'
import { Event } from '@structures/Event'

const globPromise = promisify(glob)
const commandsPath = path.join(__dirname, '..', 'commands', '*', '*{.ts,.js}')
const eventsPath = path.join(__dirname, '..', 'events', '*{.ts,.js}')

export class ExtendedClient extends Client {
  public readonly commands: Collection<string, CommandType> = new Collection()
  public readonly aliases: Collection<string, string> = new Collection()

  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_MEMBERS,
      ],
    })
  }

  /**
   * Start the bot validating the config, registering modules and logging in
   */
  start() {
    this.validateConfig(botConfig)
    this.registerModules()
    this.login(botConfig.token)
  }

  /**
   * Load all commands and events
   */
  async registerModules(): Promise<void> {
    const slashCommands: ApplicationCommandDataResolvable[] = []
    const commandFiles = await globPromise(commandsPath)

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath)

      if (!command.name) return

      if (command.slash === 'both') {
        this.commands.set(command.name, command)
        command.aliases?.forEach((alias) =>
          this.aliases.set(alias, command.name)
        )
        slashCommands.push(command)
      } else if (!command.slash) {
        this.commands.set(command.name, command)
        command.aliases.forEach((alias) =>
          this.aliases.set(alias, command.name)
        )
      } else {
        slashCommands.push(command)
      }
    })

    // Event
    const eventFiles = await globPromise(eventsPath)
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath)

      if (event.event === 'ready') {
        // When ready register commands!
        this.on(event.event, (args) => {
          event.run(args)
          this.registerCommands({
            commands: slashCommands,
            guildId: botConfig.guildId,
          })
        })
      } else {
        this.on(event.event, event.run)
      }
    })
  }

  /**
   * Register slash commands
   */
  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    // If provided a guild id the slash command will only work on that guild!
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands)
      logger.info(`Registering commands to ${guildId}`)
    } else {
      this.application?.commands.set(commands)
      logger.info('Registering global commands')
    }
  }

  /**
   * Import file with import()
   */
  async importFile(filePath: string): Promise<any> {
    const imported = await import(filePath)

    return imported?.default
  }

  /**
   * Checks if the user provided a token
   * @param config The bot configuration (token, prefix, etc.)
   */
  validateConfig(config: BotConfiguration): void {
    if (!config.token) {
      throw new Error('You need to specify your Discord bot token!')
    }
  }
}
