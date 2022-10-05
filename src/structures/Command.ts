import { MessagePayload } from 'discord.js'

import { ICommand, RunOptions } from '@deepz/types/command'

import { CustomMessageEmbed } from './MessageEmbed'

/**
 * Class for creating a command
 */
export abstract class BaseCommand implements ICommand {
  abstract run(
    options: RunOptions
  ): Promise<CustomMessageEmbed | MessagePayload | string>
}
