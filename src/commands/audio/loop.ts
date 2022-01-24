import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class LoopCommand implements Command {
  commandNames = ['loop', 'repeat']
  commandExamples = [
    {
      example: 'd.loop',
      description: 'Good song... Loop that please!',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.loop'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}loop to loop the current playing song.`
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

    queue.loop = true

    if (queue.songs.length > 1) {
      await originalMessage.channel.send(
        `**:notes: ${originalMessage.author.username} just looped the actual queue.**`
      )
    } else {
      await originalMessage.channel.send(
        `**:notes: ${
          originalMessage.author.username
        } just looped the actual song ${queue.nowPlaying.title || ''}.**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
