import { CommandContext } from '../models/command_context'

/**
 * Example and description
 */
type Example = {
  example: string
  description: string
}

/**
 * Command class
 */
export interface Command {
  /**
   * List of aliases for the command.
   *
   * The first name in the list is the primary command name.
   */
  readonly commandNames: string[]

  /**
   * Array of examples usage
   */
  readonly commandExamples: Example[]

  /**
   * <prefix><command>
   */
  readonly commandUsage: string

  /**
   * Category (based on the folder)
   */
  readonly commandCategory: string

  /**
   * Usage documentation.
   * @param commandPrefix The bot prefix
   */
  getHelpMessage(commandPrefix: string): string

  /**
   * Execute the command.
   * @param parsedUserCommand The command context
   */
  run(parsedUserCommand: CommandContext): Promise<void>

  /**
   * Returns whether or not the requesting user can use the command in the current context.
   * @param parsedUserCommand The command context
   */
  hasPermissionToRun(parsedUserCommand: CommandContext): boolean
}
