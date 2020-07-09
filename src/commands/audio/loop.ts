import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class LoopCommand implements Command {
  commandNames = ['loop', 'repeat']
  commandExamples = [
    {
      example: 'd.loop 3',
      description: 'Good song... Loop 3 times please!',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.loop <number of times>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}loop to loop the current playing song.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    const voiceChannel = originalMessage.member.voice.channel

    if (!args[0].match(/^\d+$/)) {
      const message = await originalMessage.channel.send(
        `**:x: Please provide a number of times you want to loop!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })
    }

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

    if (!queue.playing || !queue) {
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

    for (let i = 0; i < parseInt(args[0]); i++) {
      queue.songs.unshift(queue.nowPlaying)
    }

    await originalMessage.channel.send(
      `**:notes: ${originalMessage.author.username} just looped the song ${
        queue.nowPlaying.title
      } ${parseInt(args[0]) === 1 ? 'time' : 'times'}**`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
