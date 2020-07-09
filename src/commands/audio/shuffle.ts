import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class ShuffleCommand implements Command {
  commandNames = ['shuffle']
  commandExamples = [
    {
      example: 'd.resume',
      description: 'Random music...',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.shuffle'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}shuffle to shuffle the song queue.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    const voiceChannel = originalMessage.member.voice.channel

    if (!voiceChannel) {
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, join a channel and try again`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })
      return
    }

    if (queue.dispatcher === null) {
      const message = await originalMessage.channel.send(
        '**:x: There is no song playing right now!**'
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (queue.songs.length < 1) {
      const message = await originalMessage.channel.send(
        '**:x: There are no songs in queue!**'
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    shuffleQueue(queue.songs)

    const titleArray = []

    queue.songs.slice(0, 10).forEach((song) => {
      titleArray.push(song.title)
    })

    let numOfEmbedFields = 10

    if (titleArray.length < 10) numOfEmbedFields = titleArray.length

    const queueEmbed = new MessageEmbed()
      .setColor('#4360FB')
      .setTitle('New Music Queue')

    for (let i = 0; i < numOfEmbedFields; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`)
    }

    originalMessage.channel.send(queueEmbed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[queue[i], queue[j]] = [queue[j], queue[i]]
  }
}
