import { MessagePayload } from 'discord.js'

import { MetadataKeys } from '@deepz/decorators/metadata-keys'
import {
  CommandOptions,
  ICommand,
  ICommandConstructor,
  RunOptions,
} from '@deepz/types/command'

import { CustomMessageEmbed } from './MessageEmbed'

/**
 * Class for creating a command
 */
export abstract class BaseCommand implements ICommand {
  abstract run(
    options: RunOptions
  ): Promise<CustomMessageEmbed | MessagePayload | string>

  public static getOptions(target: ICommandConstructor): CommandOptions {
    return Reflect.getMetadata(MetadataKeys.Command, target.prototype)
  }
}
