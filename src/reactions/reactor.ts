import { Message, MessageReaction } from 'discord.js'

import { botConfig as config } from '../config'

const ACK_REACTIONS = ['👍', '🎮', '💚', '🍜', '✅']
const EXPIRED_REACTIONS = ['🖤']
const FAILURE_REACTIONS = ['⛔', '🚫', '❌']

/**
 * Reactor for notify the user if the command is being executed, failed or expired
 */
export class Reactor {
  /**
   * Enable reaction
   */
  enableReactions: boolean

  /**
   * @param enableReactions Enable reactions
   */
  constructor(enableReactions: boolean) {
    this.enableReactions = enableReactions
  }

  /**
   * Indicates to the user that the command was executed successfully.
   * @param message Message information
   * @returns null | MessageReaction
   */
  async success(message: Message): Promise<null | MessageReaction> {
    if (!this.enableReactions) return

    return message.react(this.getRandom(ACK_REACTIONS))
  }

  /**
   * Indicates to the user that the command failed for some reason.
   * @param message Message information
   * @returns null | MessageReaction
   */
  async failure(message: Message): Promise<null | MessageReaction> {
    if (!this.enableReactions) return

    await message.reactions.removeAll()
    return message.react(this.getRandom(FAILURE_REACTIONS))
  }

  /**
   * Indicates to the user that the command is no longer active, as intended.
   * @param message Message information
   * @returns null | MessageReaction
   */
  async expired(message: Message): Promise<null | MessageReaction> {
    if (!this.enableReactions) return

    await message.reactions.removeAll()
    return message.react(this.getRandom(EXPIRED_REACTIONS))
  }

  /**
   * Gets a random element of an array.
   * @param array String array
   */
  private getRandom(array: string[]) {
    return array[Math.floor(Math.random() * array.length)]
  }
}

export const reactor = new Reactor(config.enableReactions)
