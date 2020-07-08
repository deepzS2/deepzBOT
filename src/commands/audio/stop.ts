import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class StopCommand implements Command {
  commandNames = ['stop']
  commandExamples = [
    {
      example: 'd.stop',
      description: 'Stop that queue please...',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.stop'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}stop to the bot stop to play the musics on the queue.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if (!originalMessage.member.voice.channel) {
      originalMessage.channel.send(
        `${originalMessage.author.username}, you have to be in a voice channel to stop the music!`
      )
      return
    }

    await originalMessage.channel.send(
      `**:notes: ${originalMessage.author.username} just stop the queue! Now I'm gonna rest :sleeping:**`
    )
    queue.songs = []
    queue.connection.dispatcher.end()
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
