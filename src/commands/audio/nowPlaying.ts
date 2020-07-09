import { MessageEmbed, Message } from 'discord.js'

import { Command } from '@customTypes/commands'
import { Song, Queue } from '@customTypes/queue'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class NowPlayingCommand implements Command {
  commandNames = ['nowplaying', 'np', 'now-playing', 'current-playing', 'song']
  commandExamples = [
    {
      example: 'd.nowplaying',
      description: 'Which song is that???',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.nowplaying'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}nowplaying to see the current music playing.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if ((!queue.playing && !queue.nowPlaying) || !queue) {
      const message = await originalMessage.channel.send(
        `**:x: There is no song playing right now...**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    const song = queue.nowPlaying

    const description = playbackBar(originalMessage, song, queue)

    const videoEmbed = new MessageEmbed()
      .setThumbnail(song.thumbnail)
      .setColor('#4360FB')
      .setTitle(song.title)
      .setDescription(description)

    originalMessage.channel.send(videoEmbed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function playbackBar(message: Message, song: Song, queue: Queue) {
  const passedTimeInMS = queue.dispatcher.streamTime
  const passedTimeInMSObj = {
    seconds: Math.floor((passedTimeInMS / 1000) % 60),
    minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
    hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24),
  }
  const passedTimeFormatted = formatDuration(passedTimeInMSObj)

  const totalDurationObj = song.rawDuration
  const totalDurationFormatted = song.duration

  let totalDurationInMS = 0
  Object.keys(totalDurationObj).forEach(function (key) {
    if (key === 'hours') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000
    } else if (key === 'minutes') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000
    } else if (key === 'seconds') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100
    }
  })
  const playBackBarLocation = Math.round(
    (passedTimeInMS / totalDurationInMS) * 10
  )
  let playBack = ''
  for (let i = 1; i < 21; i++) {
    if (playBackBarLocation === 0) {
      playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
      break
    } else if (playBackBarLocation === 10) {
      playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:'
      break
    } else if (i === playBackBarLocation * 2) {
      playBack = playBack + ':musical_note:'
    } else {
      playBack = playBack + '▬'
    }
  }
  playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`
  return playBack
}

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? durationObj.hours + ':' : ''}${
    durationObj.minutes ? durationObj.minutes : '00'
  }:${
    durationObj.seconds < 10
      ? '0' + durationObj.seconds
      : durationObj.seconds
      ? durationObj.seconds
      : '00'
  }`
  return duration
}
