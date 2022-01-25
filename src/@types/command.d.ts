import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  ChatInputApplicationCommandData,
  GuildMember,
  PermissionResolvable,
  Message,
} from 'discord.js'

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

type RunFunction = (options: RunOptions) => unknown | string

export type CommandType = {
  userPermissions?: PermissionResolvable[]
  slash?: boolean | 'both'
  run: RunFunction
} & ChatInputApplicationCommandData
