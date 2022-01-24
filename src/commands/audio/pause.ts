import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class PauseCommand implements Command {
  commandNames = ['pause', 'pause-song', 'hold']
  commandExamples = [
    {
      example: 'd.pause',
      description: "Pause the music!!! Mom's calling...",
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.pause'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}pause to pause the actual music.`
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

    originalMessage.channel.send('**:pause_button: Song paused!**')

    queue.dispatcher.pause()
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
