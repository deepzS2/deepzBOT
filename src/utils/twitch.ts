import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js'
import https from 'https'

import { GuildsRepository } from '../database'

export default class Twitch {
  readonly bot: Client

  constructor(bot: Client) {
    this.bot = bot
  }

  /**
   * Check if someone is on stream
   */
  public async tickTwitchCheck(): Promise<void> {
    const Guilds = await GuildsRepository()
    const guilds = await Guilds.find()

    guilds.forEach((value) => {
      if (value.twitchs && value.twitchs.length !== 0) {
        try {
          value.twitchs.forEach(async (twitch) => {
            await this.checkTwitch(
              twitch,
              this.bot.guilds.cache.find((guild) => guild.id === value.id),
              this.bot
            )
          })
        } catch (error) {
          console.error(error)
        }
      }
    })
  }

  public async checkTwitch(
    streamer: string,
    guild: Guild,
    bot: Client,
    now = false
  ): Promise<void> {
    try {
      const response = await this.getUser(streamer)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((response as Record<string, any>).users.length === 0) {
        return
      }

      const apiPath = `/kraken/streams/${
        (response as Record<string, unknown>).users[0]._id
      }`

      const opt = {
        host: 'api.twitch.tv',
        path: apiPath,
        headers: {
          'Client-ID': process.env.TWITCH_API_KEY,
          Accept: 'application/vnd.twitchtv.v5+json',
        },
      }

      https
        .get(opt, (res) => {
          let body

          res.on('data', (chunk) => {
            body += chunk
          })

          res.on('end', () => {
            let json

            try {
              json = JSON.parse((body as string).replace('undefined', ''))
            } catch (error) {
              console.error(error)
              return
            }

            if (json.status === 404) {
              console.log(`Streamer not found`)
            } else {
              this.sendToDiscord(streamer, guild, json, bot, now)
            }
          })
        })
        .on('error', (err) => {
          console.error(err)
        })
    } catch (error) {
      console.error(error)
    }
  }

  public async sendToDiscord(
    streamer: string,
    guild: Guild,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: Record<string, any>,
    bot: Client,
    sendNow = false
  ): Promise<void> {
    const Guilds = await GuildsRepository()

    if (res && res.stream) {
      if (!sendNow) {
        const started = new Date(res.stream.created_at)

        started.setMinutes(started.getMinutes() + 30)

        const nowTime = Date.now()

        // Verifies if the user started to stream for a long time to stop spamming every 30 minutes
        if (started.getTime() <= nowTime) {
          return
        }
      }

      const {
        notification_channel: notificationChannel,
      } = await Guilds.findOneOrFail({
        where: { id: guild.id },
      })

      const currentTime = Math.round(new Date().getTime() / 1000)

      const embed = new MessageEmbed()
        .setTitle(
          `Twitch streamer ${streamer} started streaming! Click here to watch!`
        )
        .setColor('#4360FB')
        .setDescription(
          `**${res.stream.channel.status}**\nPlaying: ${res.stream.game}\n\n`
        )
        .setImage(`${res.stream.preview.large}?junktimestamp=${currentTime}`)
        .setThumbnail(`${res.stream.channel.logo}?junktimestamp=${currentTime}`)
        .addField('Viewers', res.stream.viewers, true)
        .addField(`Followers`, res.stream.channel.followers, true)
        .setURL(res.stream.channel.url)

      if (notificationChannel) {
        const channel = guild.channels.cache.find(
          (value) => value.id === notificationChannel
        )

        ;(channel as TextChannel).send('@everyone', embed)
      } else {
        let found = 0
        guild.channels.cache.map((c) => {
          if (found === 0) {
            if (c.type === 'text') {
              if (c.permissionsFor(bot.user).has('VIEW_CHANNEL') === true) {
                if (c.permissionsFor(bot.user).has('SEND_MESSAGES') === true) {
                  ;(c as TextChannel).send('@everyone', embed)
                  found = 1
                }
              }
            }
          }
        })
      }
    }
  }

  private getUser(user: string) {
    return new Promise((resolve, reject) => {
      const opt2 = {
        host: 'api.twitch.tv',
        path: '/kraken/users?login=' + user,
        headers: {
          'Client-ID': process.env.TWITCH_API_KEY,
          Accept: 'application/vnd.twitchtv.v5+json',
        },
      }

      https
        .get(opt2, (res) => {
          let body

          res.on('data', (chunk) => {
            body += chunk
          })

          res.on('end', () => {
            let json

            try {
              json = JSON.parse((body as string).replace('undefined', ''))
              resolve(json)
            } catch (error) {
              console.error(error)
              reject(error)
            }
          })
        })
        .on('error', (err) => {
          console.error(err)
          reject(err)
        })
    })
  }
}
