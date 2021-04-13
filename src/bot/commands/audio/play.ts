import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import serverQueue from '@models/queue'
import MusicController from '@utils/music'

const playlistRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).[?&]list=([^#&?]+)*/
const videoRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)*/

const musicController = new MusicController()

export default class PlayCommand implements Command {
  commandNames = ['play', 'p']
  commandExamples = [
    {
      example: 'd.play https://www.youtube.com/watch?v=C_EPek0wV74',
      description:
        'THE KEY TO LIFE ON EARTH!!!! hmm.... sorry... yeah that play your music...',
    },
    {
      example: 'd.play <some song here>',
      description: `Plays the <some song here>`,
    },
    {
      example: 'd.play <some youtube playlist url here>',
      description: `Plays the <some youtube playlist url here> playlist`,
    },
  ]

  commandCategory = 'Audio'

  commandUsage = 'd.play <song>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}play to the bot play your song request or add it to the queue.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const queue = serverQueue.get(originalMessage.guild.id)

    if (!args[0]) {
      const message = await originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, you need to provide a link!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })
      return
    }

    const voiceChannel = originalMessage.member.voice.channel

    if (!voiceChannel) {
      const message = await originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, you need to be in a voice channel to play music!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (queue && queue.voiceChannel.id !== voiceChannel.id) {
      const message = await originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, the bot is playing in another voice channel!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    const permissions = voiceChannel.permissionsFor(originalMessage.client.user)

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      const message = await originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, I need the permissions to join and speak in your voice channel!**`
      )

      message.delete({
        timeout: 5000,
      })

      originalMessage.delete({
        timeout: 5000,
      })

      return
    }

    if (
      // if the user entered a youtube playlist url
      args[0].match(playlistRegex)
    ) {
      await musicController.execPlaylist(
        args[0],
        originalMessage,
        queue,
        voiceChannel
      )
    } else if (args[0].match(videoRegex)) {
      await musicController.execFromYoutubeURL(
        args[0],
        originalMessage,
        queue,
        voiceChannel
      )
    } else {
      await musicController.searchVideo(
        args.join(' '),
        originalMessage,
        queue,
        voiceChannel
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
