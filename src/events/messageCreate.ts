import { Message } from 'discord.js'
import { inject } from 'inversify'

import { Event } from '@deepz/decorators'
import { BaseEvent, Client } from '@deepz/structures'
import { PrismaClient } from '@prisma/client'

@Event('messageCreate')
export default class MessageCreateEvent extends BaseEvent<'messageCreate'> {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run(client: Client, message: Message<boolean>) {
    // Not a BOT
    if (message.author.bot) return

    try {
      // No DMs
      if (message.channel.isDMBased()) return

      const {
        author: { id, username },
        guildId,
      } = message

      // Ensure that the user exists in database by when updating if does not exists create the user or just update
      await this._database.user.upsert({
        where: {
          discordId: id,
        },
        create: {
          discordId: id,
          username: username,
        },
        update: {
          balance: {
            increment: Math.floor(Math.random() * 7) + 3,
          },
        },
      })

      const guildMemberExists = await this._database.guildMembers.findFirst({
        where: {
          guildId: guildId,
          userId: id,
        },
      })

      if (!guildMemberExists) {
        await this._database.guildMembers.create({
          data: {
            guildId: guildId,
            userId: id,
          },
        })
      }

      await this._database.guildMembers.updateMany({
        data: {
          experience: {
            increment: Math.floor(Math.random() * 15) + 10,
          },
        },
        where: {
          guildId: guildId,
          userId: id,
        },
      })
    } catch (error) {
      this._logger.error(error, 'Error upserting the user in database!')
    }
  }
}
