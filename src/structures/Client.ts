import { Player } from 'discord-music-player'
import {
  ActivitiesOptions,
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  ActivityType,
  GatewayIntentBits,
} from 'discord.js'
import glob from 'glob'
import path from 'path'
import { promisify } from 'util'

import { botConfig, isDev } from '@deepz/config'
import logger from '@deepz/logger'
import { Event } from '@deepz/structures'
import { RegisterCommandsOptions } from '@deepz/types/client'
import { CommandType } from '@deepz/types/command'
import { BotConfiguration } from '@deepz/types/environment'
import { PrismaClient } from '@prisma/client'

const globPromise = promisify(glob)
const commandsPath = path.join(__dirname, '..', 'commands', '*', '*{.ts,.js}')
const eventsPath = path.join(__dirname, '..', 'events', '*{.ts,.js}')

export class ExtendedClient extends Client {
  private readonly ACTIVITIES: ActivitiesOptions[] = [
    {
      name: 'Delivering a new version to you!',
      type: ActivityType.Playing,
    },
    {
      name: 'Now with slash commands! Try /help',
      type: ActivityType.Playing,
    },
    {
      name: 'New version being developed!',
      type: ActivityType.Playing,
    },
  ]

  public readonly database = new PrismaClient()
  public readonly commands: Collection<string, CommandType> = new Collection()
  public readonly aliases: Collection<string, string> = new Collection()
  public readonly player = new Player(this, {
    leaveOnEmpty: true,
    quality: 'high',
    deafenOnJoin: true,
    leaveOnStop: true,
    leaveOnEnd: false,
  })

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    })
  }

  /**
   * Start the bot validating the config, registering modules and logging in
   */
  public async start() {
    this.validateConfig(botConfig)
    await this.registerModules()
    this.login(botConfig.token)
    this.setPresenceLoop()
  }

  /**
   * It sets the presence of the bot to a random activity every 3 minutes
   */
  private setPresenceLoop() {
    let i = 0

    setInterval(() => {
      const displayingStatus = this.ACTIVITIES[i]
      this.user.setPresence({
        status: 'dnd',
        activities: [displayingStatus],
      })

      i = i + 1 > this.ACTIVITIES.length - 1 ? 0 : i + 1
    }, 3 * 60 * 1000)
  }

  /**
   * Load all commands and events
   */
  private async registerModules(): Promise<void> {
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
          event.run(this, args)
          this.registerCommands({
            commands: slashCommands,
            guildId: isDev && botConfig.guildId,
          })
        })
      } else {
        this.on(event.event as string, (args) => event.run(this, args))
      }
    })
  }

  /**
   * Register slash commands
   */
  private async registerCommands({
    commands,
    guildId,
  }: RegisterCommandsOptions) {
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
  private async importFile(filePath: string): Promise<any> {
    const imported = await import(filePath)

    return imported?.default
  }

  /**
   * Checks if the user provided a token
   * @param config The bot configuration (token, prefix, etc.)
   */
  private validateConfig(config: BotConfiguration): void {
    if (!config.token) {
      throw new Error('You need to specify your Discord bot token!')
    }
  }
}
