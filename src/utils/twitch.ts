import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js'
import https from 'https'

import connection from '@database'

/**
 * Check if someone is on stream
 * @param bot Client
 */
export async function tickTwitchCheck(bot: Client): Promise<void> {
  const guilds = await connection('guilds')

  guilds.forEach((value) => {
    if (value.twitchs !== null && value.twitchs.length !== 0) {
      try {
        value.twitchs.forEach(async (twitch) => {
          await checkTwitch(
            twitch,
            bot.guilds.cache.find((guild) => guild.id === value.id),
            bot
          )
        })
      } catch (error) {
        console.error(error)
      }
    }
  })
}

export async function checkTwitch(
  streamer: string,
  guild: Guild,
  bot: Client
): Promise<void> {
  try {
    const response = await getUser(streamer)

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
            sendToDiscord(streamer, guild, json, bot)
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

export async function sendToDiscord(
  streamer: string,
  guild: Guild,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: Record<string, any>,
  bot: Client
): Promise<void> {
  if (res && res.stream) {
    const { notificationChannel } = await connection('guilds')
      .where('id', '=', guild.id)
      .first()
      .select('notificationChannel')

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

function getUser(user: string) {
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
