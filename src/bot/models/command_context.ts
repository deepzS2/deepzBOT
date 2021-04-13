import { Message, Client } from 'discord.js'

/**
 * A user-given command extracted from a message.
 */
export class CommandContext {
  /** Command name in all lowercase. */
  readonly parsedCommandName: string
  /** Arguments (split by space). */
  readonly args: string[]
  /** Original Message the command was extracted from. */
  readonly originalMessage: Message

  readonly commandPrefix: string

  /** The bot informations */
  readonly bot: Client

  /**
   * @param message Message informations
   * @param prefix The bot prefix
   * @param bot The client
   */
  constructor(message: Message, prefix: string, bot: Client) {
    this.commandPrefix = prefix
    const splitMessage = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)

    this.parsedCommandName = splitMessage.shift().toLowerCase()
    this.args = splitMessage
    this.originalMessage = message
    this.bot = bot
  }
}
