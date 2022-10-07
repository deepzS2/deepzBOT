import { ClientEvents } from 'discord.js'

import { BaseEvent, Client } from '@deepz/structures'

/**
 * Event callback
 */
export type RunFunction<Key extends keyof ClientEvents> = (
  client: Client,
  ...args: ClientEvents[Key]
) => any

export interface IEventConstructor extends Function {
  new (): IEvent<keyof ClientEvents>
  getName(target: typeof BaseEvent): string
}

export interface IEvent<Key extends keyof ClientEvents> {
  run(client: Client, ...args: ClientEvents[Key]): any
}
