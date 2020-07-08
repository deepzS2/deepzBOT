import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'

export default class SkipCommand implements Command {
  commandNames = ['skip']
  commandExamples = [
    {
      example: 'd.skip',
      description: 'Skip that song please...',
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.skip'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}skip to the bot skip one song from the queue.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if (!originalMessage.member.voice.channel) {
      originalMessage.channel.send(
        `**${originalMessage.author.username}, you have to be in a voice channel to stop the music!**`
      )
      return
    }

    if (!queue) {
      originalMessage.channel.send(
        `**${originalMessage.author.username}, there is no song that I could skip!**`
      )
      return
    }

    await originalMessage.channel.send(
      `**:notes: ${originalMessage.author.username} just skipped the song ${queue.songs[0].title}**`
    )
    queue.connection.dispatcher.end()
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
