import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  Intents,
} from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'

import { RegisterCommandsOptions } from '@customTypes/client'
import { CommandType } from '@customTypes/command'
import { BotConfiguration } from '@customTypes/environment'
import { Event } from '@root/structures/Event'

import { botConfig } from '../config'

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
  public readonly commands: Collection<string, CommandType> = new Collection()

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
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    )

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath)

      if (!command.name) return

      // If not a slash command or both
      if (!command.slash || command.slash === 'both')
        this.commands.set(command.name, command)

      // If a slash command or both
      if (command.slash || command.slash === 'both') slashCommands.push(command)
    })

    // Event
    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`)
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
      console.log(`Registering commands to ${guildId}`)
    } else {
      this.application?.commands.set(commands)
      console.log('Registering global commands')
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
