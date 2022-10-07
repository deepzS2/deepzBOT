import { stripIndents } from 'common-tags'
import { Guild } from 'discord.js'
import { inject } from 'inversify'

import { Event } from '@deepz/decorators'
import { BaseEvent, Client } from '@deepz/structures'
import { PrismaClient } from '@prisma/client'

@Event('guildCreate')
export default class GuildCreateEvent extends BaseEvent<'guildCreate'> {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run(client: Client, guild: Guild) {
    const channel = guild.channels.cache.find(
      (c) =>
        c.permissionsFor(client.user).has('ViewChannel') &&
        c.permissionsFor(client.user).has('SendMessages') &&
        c.isTextBased()
    )

    if (channel.isTextBased())
      channel?.send(stripIndents`
        **Thanks for adding me!! My name is deepz**
        It's a honor being invited to your server!
        For help with commands try \`/help\` or \`/help <command>\`.
      `)

    try {
      await this._database.guild.create({
        data: {
          discordId: guild.id,
          name: guild.name,
        },
      })
    } catch (error) {
      this._logger.error(error, 'Error inserting guild into database')
    }
  }
}
