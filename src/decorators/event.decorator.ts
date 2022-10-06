import { ClientEvents } from 'discord.js'

import logger from '@deepz/logger'

import { MetadataKeys } from './metadata-keys'

export function Event(name: keyof ClientEvents): ClassDecorator {
  return (target) => {
    const metadataExists = Reflect.getMetadata(
      MetadataKeys.Command,
      target.prototype
    )

    if (metadataExists) {
      logger.error(
        `Event Decorator used more than 1 time in ${target.name} class`
      )

      return target
    }

    Reflect.defineMetadata(MetadataKeys.Command, name, target.prototype)

    return target
  }
}
