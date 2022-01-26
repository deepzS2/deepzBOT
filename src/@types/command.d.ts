import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData,
  GuildMember,
  PermissionResolvable,
  Message,
} from 'discord.js'

import CustomMessageEmbed from '@structures/MessageEmbed'

import { ExtendedClient } from '../structures/Client'

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember
}

interface RunOptions {
  client: ExtendedClient
  interaction?: ExtendedInteraction
  message?: Message
  args: CommandInteractionOptionResolver | string[]
}

type RunFunction = (options: RunOptions) => Promise<CustomMessageEmbed | string>

export type CommandType = {
  aliases?: string[]
  slash?: boolean | 'both'
  userPermissions?: PermissionResolvable[]
  run: RunFunction
} & ChatInputApplicationCommandData
