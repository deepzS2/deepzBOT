import { ClientEvents } from 'discord.js'

import { MetadataKeys } from '@deepz/decorators/metadata-keys'
import { IEvent, IEventConstructor } from '@deepz/types/event'

import { ExtendedClient } from './Client'

/**
 * Class for creating a event
 */
export abstract class BaseEvent<Key extends keyof ClientEvents>
  implements IEvent<Key>
{
  abstract run(
    client: ExtendedClient,
    ...args: ClientEvents[Key]
  ): any | Promise<any>

  public static getName(target: IEventConstructor): string {
    return Reflect.getMetadata(MetadataKeys.Event, target.prototype)
  }
}
