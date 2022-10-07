import { ApplicationCommandDataResolvable } from 'discord.js'
import { Logger as PinoLogger } from 'pino'

export interface RegisterCommandsOptions {
  guildId?: string
  commands: ApplicationCommandDataResolvable[]
}

export type Logger = PinoLogger<any>
