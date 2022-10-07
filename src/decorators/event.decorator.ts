import { ClientEvents } from 'discord.js'

import { MetadataKeys } from './metadata-keys'

export function Event(name: keyof ClientEvents): ClassDecorator {
  return (target) => {
    const metadataExists = Reflect.getMetadata(
      MetadataKeys.Event,
      target.prototype
    )

    if (metadataExists) {
      return target
    }

    Reflect.defineMetadata(MetadataKeys.Event, name, target.prototype)

    return target
  }
}
