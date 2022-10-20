import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData,
  GuildMember,
  PermissionResolvable,
  MessagePayload,
} from 'discord.js'

import { Client, CustomMessageEmbed, BaseCommand } from '@deepz/structures'

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember
}

export interface RunOptions {
  client: Client
  interaction: ExtendedInteraction
  args: CommandInteractionOptionResolver
}

// export type RunFunction = (
//   options: RunOptions
// ) => Promise<CustomMessageEmbed | MessagePayload | string>

export type CommandCategory =
  | 'INFO'
  | 'FUNNY'
  | 'CORE'
  | 'ECONOMY'
  | 'SOCIAL'
  | 'AUDIO'
  | 'MODERATION'
  | 'GAMES'

// export type CommandType = {
//   category: CommandCategory
//   examples?: string[]
//   defaultMemberPermissions?: PermissionResolvable[]
//   run: RunFunction
// } & ChatInputApplicationCommandData

export type CommandOptions = {
  category: CommandCategory
  examples?: string[]
  defaultMemberPermissions?: PermissionResolvable[]
} & ChatInputApplicationCommandData

export interface ICommandConstructor extends Function {
  new (): ICommand
  getOptions(target: typeof BaseCommand): CommandOptions
}

export interface ICommand {
  run(
    options: RunOptions
  ): Promise<CustomMessageEmbed | MessagePayload | string>
}

export interface ICommandData {
  instance: ICommand
  options: CommandOptions
}
