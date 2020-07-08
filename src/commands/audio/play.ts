import { Guild } from 'discord.js'
import ytdl from 'ytdl-core'

import { Command } from '@customTypes/commands'
import { Song } from '@customTypes/queue'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class PlayCommand implements Command {
  commandNames = ['play', 'p']
  commandExamples = [
    {
      example: 'd.play https://www.youtube.com/watch?v=C_EPek0wV74',
      description:
        'THE KEY TO LIFE ON EARTH!!!! hmm.... sorry... yeah that play your music...',
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
      originalMessage.channel.send(
        `${originalMessage.author.username}, you need to provide a link!`
      )
      return
    }

    const voiceChannel = originalMessage.member.voice.channel

    if (!voiceChannel) {
      originalMessage.channel.send(
        `${originalMessage.author.username}, you need to be in a voice channel to play music!`
      )
      return
    }

    const permissions = voiceChannel.permissionsFor(originalMessage.client.user)

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      originalMessage.channel.send(
        `${originalMessage.author.username}, I need the permissions to join and speak in your voice channel!`
      )
      return
    }

    const songInfo = await ytdl.getInfo(args[0])

    const time = Number(songInfo.videoDetails.lengthSeconds)

    const minutes = Math.floor(time / 60)

    const seconds = time - minutes * 60

    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      duration: `${minutes}:${seconds}`,
    }

    if (!queue) {
      const queueContruct = {
        textChannel: originalMessage.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      }

      serverQueue.set(originalMessage.guild.id, queueContruct)

      queueContruct.songs.push(song)

      try {
        const connection = await voiceChannel.join()
        originalMessage.channel.send(
          `**:notes: Successfully connected to your channel ${connection.voice.channel.name}!**`
        )
        connection.voice.setSelfDeaf(true)
        queueContruct.connection = connection
        play(originalMessage.guild, queueContruct.songs[0])
      } catch (err) {
        console.log(err)
        serverQueue.delete(originalMessage.guild.id)
        originalMessage.channel.send(err)
      }
    } else {
      queue.songs.push(song)
      originalMessage.channel.send(
        `:notes: **${song.title}** has been added to the queue!`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function play(guild: Guild, song: Song) {
  const queue = serverQueue.get(guild.id)
  if (!song) {
    queue.voiceChannel.leave()
    serverQueue.delete(guild.id)
    return
  }

  const dispatcher = queue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      queue.songs.shift()
      play(guild, queue.songs[0])
    })
    .on('error', (error) => {
      console.error(error)
    })

  dispatcher.setVolumeLogarithmic(queue.volume / 5)
  queue.textChannel.send(
    `:notes: Added to queue your song: **${song.title} (${song.duration})**`
  )
}
