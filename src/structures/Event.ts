import { ClientEvents } from 'discord.js'

import { IEvent } from '@deepz/types/event'

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
}
