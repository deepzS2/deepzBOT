import { Message, VoiceChannel, Guild, MessageEmbed } from 'discord.js'
import YoutubeAPI from 'simple-youtube-api'
import ytdl from 'ytdl-core'

import { Queue, Song } from '@customTypes/queue'
import queueModel from '@models/queue'

const youtube = new YoutubeAPI(process.env.YOUTUBE_TOKEN)

export default class MusicController {
  async searchVideo(
    name: string,
    originalMessage: Message,
    serverQueue: Queue,
    voiceChannel: VoiceChannel
  ): Promise<void> {
    const constructSongObj = this.constructSongObj
    const play = MusicController.play
    const formatDuration = this.formatDuration

    const videos = await youtube
      .searchVideos(name, 5)
      .catch(async function (error) {
        console.error(error)

        const message = await originalMessage.channel.send(
          '**:x: There was a problem searching the video you requested :(**'
        )

        message.delete({
          timeout: 5000,
        })

        originalMessage.delete({
          timeout: 5000,
        })
      })

    if (videos.length < 5 || !videos) {
      const message = await originalMessage.channel.send(
        `**:x:I had some trouble finding what you were looking for, please try again or be more specific**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    const vidNameArr = []

    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}: ${videos[i].title}`)
    }

    vidNameArr.push('exit')

    const embed = new MessageEmbed()
      .setColor('#4360FB')
      .setAuthor(
        originalMessage.author.username,
        originalMessage.author.displayAvatarURL()
      )
      .setTitle('Choose a song by commenting a number between 1 and 5!')
      .addField('**:musical_note: Song 1**', vidNameArr[0])
      .addField('**:musical_note: Song 2**', vidNameArr[1])
      .addField('**:musical_note: Song 3**', vidNameArr[2])
      .addField('**:musical_note: Song 4**', vidNameArr[3])
      .addField('**:musical_note: Song 5**', vidNameArr[4])
      .addField('**:x: Exit**', 'exit')

    const songEmbed = await originalMessage.channel.send({ embed })

    originalMessage.channel
      .awaitMessages(
        function (msg: Message) {
          return (
            ((parseInt(msg.content) > 0 && parseInt(msg.content) < 6) ||
              msg.content === 'exit') &&
            msg.author.id === originalMessage.author.id
          )
        },
        {
          max: 1,
          time: 60000,
          errors: ['time'],
        }
      )
      .then(async function (response) {
        const videoIndex = parseInt(response.first().content)

        let queue: Queue

        if (!serverQueue) {
          const queueContruct = {
            textChannel: originalMessage.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: false,
            nowPlaying: null,
            dispatcher: null,
            loop: false,
          }

          queue = queueModel
            .set(originalMessage.guild.id, queueContruct)
            .get(originalMessage.guild.id)
        } else {
          queue = serverQueue
        }

        if (response.first().content === 'exit') return songEmbed.delete()

        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(async (video) => {
            if (video.raw.snippet.liveBroadcastContent === 'live') {
              songEmbed.delete()

              const message = await originalMessage.channel.send(
                `**:x: I don't support live streams!**`
              )

              message.delete({
                timeout: 5000,
              })

              return originalMessage.delete({
                timeout: 5000,
              })
            }

            queue.songs.push(constructSongObj(video, formatDuration))

            if (queue.playing === false) {
              if (songEmbed) {
                songEmbed.delete()
              }

              try {
                const connection = await voiceChannel.join()
                const message = await originalMessage.channel.send(
                  `**:notes: Successfully connected to your channel ${connection.voice.channel.name}!**`
                )

                message.delete({
                  timeout: 5000,
                })

                connection.voice.setSelfDeaf(true)

                queue.connection = connection

                play(originalMessage.guild, queue.songs[0], originalMessage)
              } catch (err) {
                console.error(err)

                queueModel.delete(originalMessage.guild.id)

                originalMessage.channel.send(err)
              }
            } else {
              if (songEmbed) {
                songEmbed.delete()
              }

              originalMessage.channel.send(
                `:notes: **${video.title}** has been added to the queue!`
              )
            }
          })
          .catch(function (err) {
            console.error(err)

            if (songEmbed) {
              songEmbed.delete()
            }

            return originalMessage.channel.send(
              '**:x: An error has occured when trying to get the video ID from youtube**'
            )
          })
      })
      .catch(async function (error) {
        if (songEmbed) {
          songEmbed.delete()
        }

        console.error(error)

        const message = await originalMessage.channel.send(
          '**:x: Please try again and enter a number between 1 and 5 or exit**'
        )

        message.delete({
          timeout: 5000,
        })

        return originalMessage.delete({
          timeout: 5000,
        })
      })
  }

  async execFromYoutubeURL(
    url: string,
    originalMessage: Message,
    serverQueue: Queue,
    voiceChannel: VoiceChannel
  ): Promise<void> {
    const song = url
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)

    const id = song[2].split(/[^0-9a-z_-]/i)[0]
    const constructSongObj = this.constructSongObj
    const play = MusicController.play
    const formatDuration = this.formatDuration

    const video = await youtube.getVideoByID(id).catch(async function () {
      const message = await originalMessage.channel.send(
        `**:x: There was a problem getting the video you provided!**`
      )

      message.delete({
        timeout: 5000,
      })

      return originalMessage.delete({
        timeout: 5000,
      })
    })

    if (video.raw.snippet.liveBroadcastContent === 'live') {
      const message = await originalMessage.channel.send(
        "**:x: I don't support live streams!**"
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: originalMessage.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
        nowPlaying: null,
        dispatcher: null,
        loop: false,
      }

      queueModel.set(originalMessage.guild.id, queueConstruct)

      queueConstruct.songs.push(constructSongObj(video, formatDuration))

      try {
        const connection = await voiceChannel.join()

        const message = await originalMessage.channel.send(
          `**:notes: Successfully connected to your channel ${connection.voice.channel.name}!**`
        )

        message.delete({
          timeout: 10000,
        })

        connection.voice.setSelfDeaf(true)

        queueConstruct.connection = connection

        play(originalMessage.guild, queueConstruct.songs[0], originalMessage)
      } catch (err) {
        console.error(err)

        queueModel.delete(originalMessage.guild.id)
        originalMessage.channel.send(err)
      }
    } else {
      serverQueue.songs.push(constructSongObj(video, formatDuration))

      originalMessage.channel.send(
        `:notes: **${video.title}** has been added to the queue!`
      )
    }
  }

  async execPlaylist(
    url: string,
    originalMessage: Message,
    serverQueue: Queue,
    voiceChannel: VoiceChannel
  ): Promise<void> {
    const constructSongObj = this.constructSongObj
    const play = MusicController.play
    const formatDuration = this.formatDuration

    const playlist = await youtube
      .getPlaylist(url, { part: 'snippet' })
      .catch(async function () {
        const message = await originalMessage.channel.send(
          '**:x: Playlist is either private or it does not exist!**'
        )

        message.delete({
          timeout: 5000,
        })

        return originalMessage.delete({
          timeout: 5000,
        })
      })

    const videosObj = await playlist.getVideos(40).catch(async function () {
      const message = await originalMessage.channel.send(
        '**:x: There was a problem getting one of the videos in the playlist!**'
      )

      message.delete({
        timeout: 5000,
      })

      return originalMessage.delete({
        timeout: 5000,
      })
    })

    let queue: Queue

    if (!serverQueue) {
      const queueContruct = {
        textChannel: originalMessage.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: false,
        nowPlaying: null,
        dispatcher: null,
        loop: false,
      }

      queue = queueModel
        .set(originalMessage.guild.id, queueContruct)
        .get(originalMessage.guild.id)
    } else {
      queue = serverQueue
    }
    console.log(videosObj[0])

    videosObj.forEach(async (video) => {
      queue.songs.push(
        constructSongObj(
          await video.fetch({ part: ['snippet', 'contentDetails'] }),
          formatDuration
        )
      )
    })

    if (queue.playing === false) {
      try {
        const connection = await voiceChannel.join()

        const message = await originalMessage.channel.send(
          `**:notes: Successfully connected to your channel ${connection.voice.channel.name}!**`
        )

        message.delete({
          timeout: 10000,
        })

        await originalMessage.channel.send(
          `:notes: Started playing your playlist: **${playlist.title} with ${videosObj.length} songs!**`
        )

        connection.voice.setSelfDeaf(true)

        queue.connection = connection

        play(originalMessage.guild, queue.songs[0], originalMessage)
      } catch (err) {
        console.error(err)
        queueModel.delete(originalMessage.guild.id)
        originalMessage.channel.send(err)
      }
    } else {
      originalMessage.channel.send(
        `:notes: Added to queue your playlist: **${playlist.title} with ${videosObj.length} songs!**`
      )
    }
  }

  private formatDuration(durationObj) {
    const duration = `${durationObj.hours ? durationObj.hours + ':' : ''}${
      durationObj.minutes
        ? durationObj.minutes < 10
          ? '0' + durationObj.minutes
          : durationObj.minutes
        : '00'
    }:${
      durationObj.seconds < 10
        ? '0' + durationObj.seconds
        : durationObj.seconds
        ? durationObj.seconds
        : '00'
    }`

    return duration
  }

  private constructSongObj(video, formatDurationFunction) {
    if (!video || !video.duration) {
      return
    }

    const duration = formatDurationFunction(video.duration)
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      thumbnail: video.thumbnails.high.url,
      rawDuration: video.duration,
      duration,
    }
  }

  private static async play(guild: Guild, song: Song, message: Message) {
    try {
      const queue = queueModel.get(guild.id)
      const play = MusicController.play

      if (!queue) {
        return
      }

      if (!song) {
        queue.voiceChannel.leave()
        queueModel.delete(guild.id)
        return
      }

      let interval
      const songYtdl = ytdl(song.url, { filter: 'audioonly' })

      const dispatcher = queue.connection
        .play(songYtdl, { seek: 0 })
        .on('start', async () => {
          queue.dispatcher = dispatcher

          const videoEmbed = new MessageEmbed()
            .setThumbnail(song.thumbnail)
            .setColor('#4360FB')
            .addField('Now Playing:', song.title)
            .addField('Duration:', song.duration)

          if (queue.songs[1])
            videoEmbed.addField('Next Song:', queue.songs[1].title)

          const embed = await message.channel.send(videoEmbed)

          embed.delete({
            timeout: 15000,
          })

          queue.nowPlaying = song
          queue.playing = true

          interval = setInterval(() => {
            if (queue.voiceChannel.members.array().length === 1) {
              queue.songs = []
              queue.connection.dispatcher.end()

              clearInterval(interval)
            }
          }, 20000)
        })
        .on('close', () => {
          if (queue.connection.status === 4) {
            queueModel.delete(guild.id)

            if (!interval._destroyed) {
              clearInterval(interval)
            }
          }
        })
        .on('finish', () => {
          if (!interval._destroyed) {
            clearInterval(interval)
          }

          if (queue.loop) {
            queue.songs.push(queue.nowPlaying)
          }

          queue.songs.shift()

          play(guild, queue.songs[0], message)
        })
        .on('error', async (error) => {
          console.error(error)
          await message.channel.send(
            `**:x: Something went wrong! Please try again later!**`
          )
        })

      dispatcher.setVolumeLogarithmic(queue.volume / 5)
    } catch (error) {
      console.error(error)
      await message.channel.send(
        `**:x: Something went wrong! Please try again later!**`
      )
    }
  }
}
