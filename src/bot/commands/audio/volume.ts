import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class VolumeCommand implements Command {
  commandNames = ['volume', 'vol']
  commandExamples = [
    {
      example: 'd.volume 3',
      description: 'Too loud!!!',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.volume <number less than 5>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}volume to set a volume to the music playing.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if (!originalMessage.member.voice.channel) {
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, you have to be in a voice channel to set a volume!**`
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
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, there is no song to set a volume!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (!args[0]) {
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, please provide a number!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (isNaN(Number(args[0]))) {
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, this is not a number!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (Number(args[0]) > 5) {
      const message = await originalMessage.channel.send(
        `**${originalMessage.author.username}, you're trying to earrape?? Please choose a number less than 5...**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    await originalMessage.channel.send(
      `**:notes: Volume setted to ${args[0]} by ${originalMessage.author.username}**`
    )
    queue.volume = Number(args[0])
    queue.dispatcher.setVolumeLogarithmic(queue.volume / 5)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
