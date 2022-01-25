import { CommandType } from '../@types/command'

/**
 * Class for creating a command
 */
export class Command {
  constructor(commandOptions: CommandType) {
    Object.assign(this, commandOptions)
  }
}
