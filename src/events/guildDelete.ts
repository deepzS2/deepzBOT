import { Guild } from 'discord.js'

import { Event } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseEvent, ExtendedClient } from '@deepz/structures'

@Event('guildDelete')
export default class GuildDeleteEvent extends BaseEvent<'guildDelete'> {
  async run(client: ExtendedClient, guild: Guild) {
    try {
      const guildExists = await client.database.guild.findFirst({
        where: {
          discordId: guild.id,
        },
      })

      if (!guildExists) return

      await client.database.guild.delete({
        where: {
          discordId: guild.id,
        },
      })
    } catch (error) {
      logger.error(error, 'Error deleting guild from database!')
    }
  }
}
