import { MessagePayload } from 'discord.js'
import { inject, injectable } from 'inversify'

import { MetadataKeys } from '@deepz/decorators/metadata-keys'
import type {
  CommandOptions,
  ICommand,
  ICommandConstructor,
  RunOptions,
  Logger,
} from '@deepz/types/index'

import { CustomMessageEmbed } from './MessageEmbed'

/**
 * Class for creating a command
 */
@injectable()
export abstract class BaseCommand implements ICommand {
  @inject('Logger') protected readonly _logger: Logger

  abstract run(
    options: RunOptions
  ): Promise<CustomMessageEmbed | MessagePayload | string>

  public static getOptions(target: ICommandConstructor): CommandOptions {
    return Reflect.getMetadata(MetadataKeys.Command, target.prototype)
  }
}
