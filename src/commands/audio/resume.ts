import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class ResumeCommand implements Command {
  commandNames = ['resume', 'resume-song', 'continue']
  commandExamples = [
    {
      example: 'd.resume',
      description: 'Okay... Now play the music again',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.resume'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}resume to resume the actual music.`
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

    if (!queue.dispatcher.paused) {
      const message = await originalMessage.channel.send(
        "**:x: The music isn't paused!**"
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    originalMessage.channel.send('**:pause_button: Song resumed!**')

    queue.dispatcher.resume()
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
