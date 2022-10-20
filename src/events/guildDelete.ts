import { Guild } from 'discord.js'
import { inject } from 'inversify'

import { Event } from '@deepz/decorators'
import { BaseEvent, Client } from '@deepz/structures'
import { PrismaClient } from '@prisma/client'

@Event('guildDelete')
export default class GuildDeleteEvent extends BaseEvent<'guildDelete'> {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run(client: Client, guild: Guild) {
    try {
      const guildExists = await this._database.guild.findFirst({
        where: {
          discordId: guild.id,
        },
      })

      if (!guildExists) return

      await this._database.guild.delete({
        where: {
          discordId: guild.id,
        },
      })

      await this._database.guildMembers.deleteMany({
        where: {
          guildId: guild.id,
        },
      })
    } catch (error) {
      this._logger.error(error, 'Error deleting guild from database!')
    }
  }
}
