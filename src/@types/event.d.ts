import { ClientEvents } from 'discord.js'

import { ExtendedClient } from '@deepz/structures'

/**
 * Event callback
 */
export type RunFunction<Key extends keyof ClientEvents> = (
  client: ExtendedClient,
  ...args: ClientEvents[Key]
) => any

export interface IEvent<Key extends keyof ClientEvents> {
  run(client: ExtendedClient, ...args: ClientEvents[Key]): any
}
