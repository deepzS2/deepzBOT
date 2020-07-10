import { MessageEmbed, Message } from 'discord.js'

import { Command } from '@customTypes/commands'
import { Song, Queue } from '@customTypes/queue'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class NowPlayingCommand implements Command {
  commandNames = ['queue', 'list', 'songs']
  commandExamples = [
    {
      example: 'd.queue',
      description: 'That playlist looks pretty...',
    },
    {
      example: 'd.queue 2',
      description: 'That playlist looks pretty starting here...',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.queue [page]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}queue to see the current music queue.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
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

    const songs = queue.songs

    let description

    if (!args[0]) {
      description = list(songs, 1)
    } else {
      description = list(songs, parseInt(args[0]))
    }

    const videoEmbed = new MessageEmbed()
      .setColor('#4360FB')
      .setTitle(`**Total time: ${description.totalDurationFormatted}**`)
      .setDescription(description.string)

    originalMessage.channel.send(videoEmbed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function list(
  songs: Array<Song>,
  page: number
): { string: string; totalDurationFormatted: string } {
  const songPage = songs.slice(
    page === 1 ? 0 : (page - 1) * 10,
    page === 1 ? 10 : page * 10
  )

  let totalDurationInMS = 0
  let string = `**Current queue**\n\n`

  songPage.forEach((value, index) => {
    string += `**${index + 1} - ${value.title}**\n`

    totalDurationInMS += value.rawDuration.hours * 3600000
    totalDurationInMS += value.rawDuration.minutes * 60000
    totalDurationInMS += value.rawDuration.seconds * 100
  })

  const totalDurationFormatted = msToTime(totalDurationInMS)

  return { string, totalDurationFormatted }
}

function msToTime(duration: number) {
  let seconds: number | string = Math.floor((duration / 1000) % 60)
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60)
  let hours: number | string = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours + ':' + minutes + ':' + seconds
}
