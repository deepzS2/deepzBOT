import dayjs from 'dayjs'
import {
  CommandInteractionOptionResolver,
  InteractionReplyOptions,
  Message,
  MessageMentions,
  MessageOptions,
  MessagePayload,
} from 'discord.js'

import 'dayjs/locale/pt-br'
import { client } from '@deepz/index'

import { ExtendedInteraction } from './@types/command'

/**
 * Return a User object from mention
 * @param mention Mention string
 */
export const getUserFromMentions = (mention: string) => {
  if (!mention) return

  const matches = mention.match(MessageMentions.USERS_PATTERN)

  if (!matches) return

  const id = matches[1]

  return client.users.cache.get(id)
}

/**
 * Format to pt-br locale string
 * @param date The Date object
 */
export const formatDate = (date: Date) => {
  return dayjs(date, {
    locale: 'pt-br',
  }).format('DD/MM/YYYY HH:mm:ss')
}

/**
 * Capitalize a string
 */
export const capitalizeString = (str: string) =>
  str[0].toUpperCase() + str.substring(1).toLowerCase()

/**
 * Get a argument from args object
 * @param argsObj Argument object
 * @param options Argument name (interaction) and index of array (message args)
 */
export const getStringArgument = (
  argsObj: string[] | CommandInteractionOptionResolver,
  options: { argumentName: string; index: number }
): string => {
  if (argsObj instanceof CommandInteractionOptionResolver) {
    return argsObj.getString(options.argumentName)
  }

  if (argsObj.length > 0) {
    return argsObj[options.index]
  }

  return null
}

/**
 * Helper to send a message with interaction or message object
 */
export const sendMessage = async (options: {
  message?: Message
  interaction?: ExtendedInteraction
  content?: MessagePayload | MessageOptions | InteractionReplyOptions | string
}): Promise<null | Message<boolean>> => {
  if ((!options.message && !options.interaction) || !options.content) return

  if (options.message)
    return await options.message.channel.send(
      options.content as MessagePayload | MessageOptions | string
    )

  if (options.interaction)
    return (await options.interaction.followUp(
      options.content as InteractionReplyOptions | MessagePayload | string
    )) as Message<boolean>
}
