import { ClientEvents } from 'discord.js'
import { inject, injectable } from 'inversify'

import { MetadataKeys } from '@deepz/decorators/metadata-keys'
import type { IEvent, IEventConstructor, Logger } from '@deepz/types/index'

import { Client } from './Client'

/**
 * Class for creating a event
 */
@injectable()
export abstract class BaseEvent<Key extends keyof ClientEvents>
  implements IEvent<Key>
{
  @inject('Logger') protected readonly _logger: Logger

  abstract run(client: Client, ...args: ClientEvents[Key]): any | Promise<any>

  public static getName(target: IEventConstructor): string {
    return Reflect.getMetadata(MetadataKeys.Event, target.prototype)
  }
}
