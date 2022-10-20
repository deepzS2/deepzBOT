import { CommandOptions } from '@deepz/types/command'

import { MetadataKeys } from './metadata-keys'

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    const metadataExists = Reflect.getMetadata(
      MetadataKeys.Command,
      target.prototype
    )

    if (metadataExists) {
      return target
    }

    Reflect.defineMetadata(
      MetadataKeys.Command,
      {
        ...options,
        dmPermission: false,
      },
      target.prototype
    )

    return target
  }
}
