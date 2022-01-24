import {ClientEvents} from 'discord.js'

type RunFunction<Key extends keyof ClientEvents> = (
  ...args: ClientEvents[Key]
) => any

export class Event<Key extends keyof ClientEvents> {
  public readonly event: Key
  public readonly run: RunFunction<Key>

  constructor(event: Key, run: RunFunction<Key>) {
    this.event = event
    this.run = run
  }
}
