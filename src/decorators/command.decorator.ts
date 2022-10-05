import logger from '@deepz/logger'
import { CommandOptions } from '@deepz/types/command'

import { MetadataKeys } from './metadata-keys'

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    const metadataExists = Reflect.getMetadata(
      MetadataKeys.Command,
      target.prototype
    )

    if (metadataExists) {
      logger.error(
        `Command Decorator used more than 1 time in ${target.name} class`
      )

      return target
    }

    Reflect.defineMetadata(MetadataKeys.Command, options, target.prototype)

    return target
  }
}
