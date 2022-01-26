import dayjs from 'dayjs'
import { MessageMentions } from 'discord.js'

import 'dayjs/locale/pt-br'
import { client } from '@root/index'

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
