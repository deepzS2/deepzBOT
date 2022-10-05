import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData,
  GuildMember,
  PermissionResolvable,
  Message,
  MessagePayload,
} from 'discord.js'

import CustomMessageEmbed from '@deepz/structures/MessageEmbed'

import { ExtendedClient } from '../structures/Client'

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember
}

export interface RunOptions {
  client: ExtendedClient
  interaction?: ExtendedInteraction
  message?: Message
  args: CommandInteractionOptionResolver | string[]
}

export type RunFunction = (
  options: RunOptions
) => Promise<CustomMessageEmbed | MessagePayload | string>

export type CommandCategory =
  | 'INFO'
  | 'FUNNY'
  | 'CORE'
  | 'ECONOMY'
  | 'SOCIAL'
  | 'AUDIO'
  | 'MODERATION'
  | 'GAMES'

export type CommandType = {
  aliases?: string[]
  category: CommandCategory
  examples?: string[]
  userPermissions?: PermissionResolvable[]
  run: RunFunction
} & ChatInputApplicationCommandData
