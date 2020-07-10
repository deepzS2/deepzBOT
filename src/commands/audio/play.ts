import { Guild, MessageEmbed, Message } from 'discord.js'
import Youtube from 'simple-youtube-api'
import ytdl from 'ytdl-core'

import { Command } from '@customTypes/commands'
import { Song } from '@customTypes/queue'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

const youtube = new Youtube(process.env.YOUTUBE_TOKEN)

const playlistRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).[?&]list=([^#&?]+)*/
const videoRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)*/

/*
 * TODO: Playlist and search
 * REFERENCE: https://github.com/galnir/Master-Bot/blob/master/commands/music/play.js
 */

export default class PlayCommand implements Command {
  commandNames = ['play', 'p']
  commandExamples = [
    {
      example: 'd.play https://www.youtube.com/watch?v=C_EPek0wV74',
      description:
        'THE KEY TO LIFE ON EARTH!!!! hmm.... sorry... yeah that play your music...',
    },
    {
      example: 'd.play <some song here>',
      description: `Plays the <some song here>`,
    },
    {
      example: 'd.play <some youtube playlist url here>',
      description: `Plays the <some youtube playlist url here> playlist`,
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.play <song>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}play to the bot play your song request or add it to the queue.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if (!args[0]) {
      const message = await originalMessage.channel.send(
        `${originalMessage.author.username}, you need to provide a link!`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })
      return
    }

    const voiceChannel = originalMessage.member.voice.channel

    if (!voiceChannel) {
      const message = await originalMessage.channel.send(
        `${originalMessage.author.username}, you need to be in a voice channel to play music!`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    const permissions = voiceChannel.permissionsFor(originalMessage.client.user)

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      const message = await originalMessage.channel.send(
        `${originalMessage.author.username}, I need the permissions to join and speak in your voice channel!`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (
      // if the user entered a youtube playlist url
      args[0].match(playlistRegex)
    ) {
      const playlist = await youtube
        .getPlaylist(args[0])
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

      const videosObj = await playlist.getVideos().catch(async function () {
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

      if (!queue) {
        const queueContruct = {
          textChannel: originalMessage.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: false,
          nowPlaying: null,
          dispatcher: null,
        }

        serverQueue.set(originalMessage.guild.id, queueContruct)
      }

      const playlistQueue = serverQueue.get(originalMessage.guild.id)

      for (let i = 0; i < videosObj.length; i++) {
        if (videosObj[i].raw.status.privacyStatus === 'private') {
          continue
        } else {
          try {
            const video = await videosObj[i].fetch()
            playlistQueue.songs.push(constructSongObj(video))
          } catch (err) {
            console.error(err)

            const message = await originalMessage.channel.send(
              `**:x: Something went wrong... Try again later!**`
            )

            message.delete({
              timeout: 5000,
            })

            originalMessage.delete({
              timeout: 5000,
            })

            return
          }
        }
      }

      if (playlistQueue.playing === false) {
        try {
          const connection = await voiceChannel.join()

          const message = await originalMessage.channel.send(
            `**:notes: Successfully connected to your channel ${connection.voice.channel.name}!**`
          )

          message.delete({
            timeout: 10000,
          })

          await originalMessage.channel.send(
            `:notes: Started playing your playlist: **${playlist.title}**`
          )

          connection.voice.setSelfDeaf(true)

          playlistQueue.connection = connection

          play(originalMessage.guild, playlistQueue.songs[0], originalMessage)
        } catch (err) {
          console.error(err)
          serverQueue.delete(originalMessage.guild.id)
          originalMessage.channel.send(err)
        }
      } else {
        originalMessage.channel.send(
          `:notes: Added to queue your playlist: **${playlist.title}**`
        )
      }

      return
    }

    if (!args[0].match(videoRegex)) {
      const videos = await youtube
        .searchVideos(args.join(' '), 5)
        .catch(async function () {
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

          if (!queue) {
            const queueContruct = {
              textChannel: originalMessage.channel,
              voiceChannel: voiceChannel,
              connection: null,
              songs: [],
              volume: 5,
              playing: false,
              nowPlaying: null,
              dispatcher: null,
            }

            serverQueue.set(originalMessage.guild.id, queueContruct)
          }

          const playlistQueue = serverQueue.get(originalMessage.guild.id)

          if (response.first().content === 'exit') return songEmbed.delete()

          youtube
            .getVideoByID(videos[videoIndex - 1].id)
            .then(async function (video) {
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

              playlistQueue.songs.push(constructSongObj(video))

              if (!playlistQueue || playlistQueue.playing === false) {
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

                  playlistQueue.connection = connection

                  play(
                    originalMessage.guild,
                    playlistQueue.songs[0],
                    originalMessage
                  )
                } catch (err) {
                  console.error(err)

                  serverQueue.delete(originalMessage.guild.id)

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
        .catch(async function () {
          if (songEmbed) {
            songEmbed.delete()
          }
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

      return
    }

    const song = args[0]
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)

    const id = song[2].split(/[^0-9a-z_-]/i)[0]

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

    if (!queue) {
      const queueConstruct = {
        textChannel: originalMessage.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
        nowPlaying: null,
        dispatcher: null,
      }

      serverQueue.set(originalMessage.guild.id, queueConstruct)

      queueConstruct.songs.push(constructSongObj(video))

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

        serverQueue.delete(originalMessage.guild.id)
        originalMessage.channel.send(err)
      }
    } else {
      queue.songs.push(constructSongObj(video))

      originalMessage.channel.send(
        `:notes: **${video.title}** has been added to the queue!`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function play(guild: Guild, song: Song, message: Message) {
  const queue = serverQueue.get(guild.id)

  if (!song) {
    queue.voiceChannel.leave()
    serverQueue.delete(guild.id)
    return
  }

  const dispatcher = queue.connection
    .play(ytdl(song.url, { quality: 'highestaudio' }))
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
    })
    .on('finish', () => {
      queue.songs.shift()
      play(guild, queue.songs[0], message)
    })
    .on('error', (error) => {
      console.error(error)
    })

  dispatcher.setVolumeLogarithmic(queue.volume / 5)

  // queue.textChannel.send(
  //   `:notes: Added to queue your song: **${song.title} (${song.duration})**`
  // )
}

function constructSongObj(video) {
  let duration = formatDuration(video.duration)
  if (duration === '00:00') duration = 'Live Stream'
  return {
    url: `https://www.youtube.com/watch?v=${video.raw.id}`,
    title: video.title,
    thumbnail: video.thumbnails.high.url,
    rawDuration: video.duration,
    duration,
  }
}

function formatDuration(durationObj) {
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
