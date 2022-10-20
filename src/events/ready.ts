import { stripIndents } from 'common-tags'
import { TextBasedChannel } from 'discord.js'
import { inject } from 'inversify'

import { Event } from '@deepz/decorators'
import { twitch } from '@deepz/services'
import { BaseEvent, Client } from '@deepz/structures'
import { PrismaClient } from '@prisma/client'

@Event('ready')
export default class ReadyEvent extends BaseEvent<'ready'> {
  private readonly twitchLives: Map<string, string[]> = new Map()
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run(client: Client) {
    this._logger.info(
      `Validating ${client.guilds.cache.size} guilds are registered in database...`
    )

    await this.validateGuilds(client)
    await this.setTwitchsLoop(client)

    this._logger.info('Bot is online!')
  }

  async setTwitchsLoop(client: Client) {
    setInterval(async () => {
      let guilds = await this._database.guild.findMany()
      guilds = guilds.filter((guild) => guild.twitchs?.length > 0)

      const twitchPromises = guilds.map(async (guild) => {
        const { data } = await twitch.getStreams({
          channels: guild.twitchs,
        })

        const discordGuild = await client.guilds.cache.get(guild.discordId)
        const channel = (await discordGuild.channels.cache.get(
          guild.twitchNotificationChannel
        )) as TextBasedChannel

        this._logger.info(data, `Twitchs for guild ${guild.name}`)

        for (const stream of data) {
          if (
            !this.getIfAlreadyNotificated(stream.user_name, guild.discordId)
          ) {
            await channel.send(
              stripIndents`
                ${stream.user_name} is currently live with ${stream.viewer_count} viewers @everyone!
                ${stream.title}
                https://www.twitch.tv/${stream.user_name}
              `
            )

            this.setAlreadyNotificated(stream.user_name, guild.discordId)
          }
        }
      })

      await Promise.all(twitchPromises)
    }, 15 * 1000 /* 15 seconds */)
  }

  setAlreadyNotificated(id: string, guildId: string) {
    const keyExists = this.twitchLives.get(id)

    if (keyExists) {
      this.twitchLives.set(id, [...keyExists, guildId])
    } else {
      this.twitchLives.set(id, [guildId])
    }
  }

  getIfAlreadyNotificated(id: string, guildId: string) {
    const value = this.twitchLives.get(id)

    return value && value.includes(guildId)
  }

  async validateGuilds(client: Client) {
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
  }
}
