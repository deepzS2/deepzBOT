import { Player } from 'discord-music-player'
import {
  ActivitiesOptions,
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
  ApplicationCommandData,
} from 'discord.js'
import path from 'path'

import { botConfig, isDev } from '@deepz/config'
import { importFiles } from '@deepz/helpers'
import logger from '@deepz/logger'
import { BaseEvent, BaseCommand } from '@deepz/structures'
import { RegisterCommandsOptions } from '@deepz/types/client'
import { ICommandConstructor, ICommandData } from '@deepz/types/command'
import { BotConfiguration } from '@deepz/types/environment'
import { IEventConstructor } from '@deepz/types/event'
import { PrismaClient } from '@prisma/client'

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
  public readonly commands: Collection<string, ICommandData> = new Collection()
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
    const events: string[] = []
    const slashCommands: ApplicationCommandData[] = []

    // Commands
    const commandFilesGenerator = importFiles<
      ICommandConstructor,
      ICommandData
    >(commandsPath)
    let nextCommandFilesResult = await commandFilesGenerator.next()

    while (!nextCommandFilesResult.done) {
      const Command = nextCommandFilesResult.value as ICommandConstructor
      const commandData = {
        instance: new Command(),
        options: BaseCommand.getOptions(Command),
      }

      this.commands.set(commandData.options.name, commandData)
      slashCommands.push(commandData.options)
      nextCommandFilesResult = await commandFilesGenerator.next(commandData)
    }

    // Events
    const eventFilesGenerator = importFiles<IEventConstructor, string>(
      eventsPath
    )
    let nextEventFilesResult = await eventFilesGenerator.next()

    while (!nextEventFilesResult.done) {
      const Event = nextEventFilesResult.value as IEventConstructor
      const eventInstance = new Event()
      const eventName = BaseEvent.getName(Event)
      events.push(eventName)

      if (eventName === 'ready') {
        // When ready register commands!
        this.on(eventName, (args) => {
          eventInstance.run(this, args)
          this.registerCommands({
            commands: slashCommands,
            guildId: isDev && botConfig.guildId,
          })
        })
      } else {
        this.on(eventName, (args) => eventInstance.run(this, args))
      }

      nextEventFilesResult = await eventFilesGenerator.next(eventName)
    }

    logger.info(
      'Commands registered: %O\nEvents registered: %O',
      slashCommands.map((cmd) => cmd.name),
      events
    )
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
   * Checks if the user provided a token
   * @param config The bot configuration (token, prefix, etc.)
   */
  private validateConfig(config: BotConfiguration): void {
    if (!config.token) {
      throw new Error('You need to specify your Discord bot token!')
    }
  }
}
