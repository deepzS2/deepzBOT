import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  Intents,
} from 'discord.js'
import glob from 'glob'
import {promisify} from 'util'

import {RegisterCommandsOptions} from '@customTypes/client'
import {CommandType} from '@customTypes/command'
import {BotConfiguration} from '@customTypes/environment'
import {Event} from '@root/structures/Event'

import {botConfig} from '../config'

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

  start() {
    this.validateConfig(botConfig)
    this.registerModules()
    this.login(botConfig.token)
  }

  async registerModules(): Promise<void> {
    const slashCommands: ApplicationCommandDataResolvable[] = []
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    )

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath)

      if (!command.name) return

      this.commands.set(command.name, command)
      slashCommands.push(command)
    })

    this.on('ready', () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: botConfig.guildId,
      })
    })

    // Event
    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`)
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath)

      this.on(event.event, event.run)
    })
  }

  async registerCommands({commands, guildId}: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands)
      console.log(`Registering commands to ${guildId}`)
    } else {
      this.application?.commands.set(commands)
      console.log('Registering global commands')
    }
  }

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
