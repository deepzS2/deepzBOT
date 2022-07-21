import { ClientEvents } from 'discord.js'

import { ExtendedClient } from './Client'

/**
 * Event callback
 */
type RunFunction<Key extends keyof ClientEvents> = (
  client: ExtendedClient,
  ...args: ClientEvents[Key]
) => any

/**
 * Class for creating a event
 */
export class Event<Key extends keyof ClientEvents> {
  public readonly event: Key
  public readonly run: RunFunction<Key>

  constructor(event: Key, run: RunFunction<Key>) {
    this.event = event
    this.run = run
  }
}
