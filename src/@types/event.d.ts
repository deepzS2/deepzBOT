import { ClientEvents } from 'discord.js'

import { BaseEvent, ExtendedClient } from '@deepz/structures'

/**
 * Event callback
 */
export type RunFunction<Key extends keyof ClientEvents> = (
  client: ExtendedClient,
  ...args: ClientEvents[Key]
) => any

export interface IEventConstructor extends Function {
  new (): IEvent<keyof ClientEvents>
  getName(target: typeof BaseEvent): string
}

export interface IEvent<Key extends keyof ClientEvents> {
  run(client: ExtendedClient, ...args: ClientEvents[Key]): any
}
