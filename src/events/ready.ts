import { inject } from 'inversify'

import { Event } from '@deepz/decorators'
import { BaseEvent, Client } from '@deepz/structures'
import { PrismaClient } from '@prisma/client'

@Event('ready')
export default class ReadyEvent extends BaseEvent<'ready'> {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run(client: Client) {
    this._logger.info(
      `Validating ${client.guilds.cache.size} guilds are registered in database...`
    )

    const guildsValidationPromises = client.guilds.cache.map(async (guild) => {
      const guildExists = await this._database.guild.findFirst({
        where: {
          discordId: guild.id,
        },
      })

      if (!guildExists) {
        await this._database.guild.create({
          data: {
            discordId: guild.id,
            name: guild.name,
          },
        })
      }
    })

    await Promise.all(guildsValidationPromises)

    this._logger.info('Bot is online!')
  }
}
