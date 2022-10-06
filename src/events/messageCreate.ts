import { Message } from 'discord.js'

import { Event } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseEvent, ExtendedClient } from '@deepz/structures'

@Event('messageCreate')
export default class MessageCreateEvent extends BaseEvent<'messageCreate'> {
  async run(client: ExtendedClient, message: Message<boolean>) {
    // Not a BOT
    if (message.author.bot) return

    try {
      // No DMs
      if (message.channel.isDMBased()) return

      const { id, username } = message.author

      // Ensure that the user exists in database by when updating if does not exists create the user or just update
      await client.database.user.upsert({
        where: {
          discordId: id,
        },
        create: {
          discordId: id,
          username: username,
        },
        update: {
          experience: {
            increment: Math.floor(Math.random() * 15) + 10,
          },
          balance: {
            increment: Math.floor(Math.random() * 7) + 3,
          },
        },
      })
    } catch (error) {
      logger.error(error, 'Error upserting the user in database!')
    }
  }
}
