import { Message } from 'discord.js'
import path from 'path'

import logger from '@deepz/logger'
import { ExtendedInteraction } from '@deepz/types/command'
import { createAudioResource } from '@discordjs/voice'
import { isInteraction } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'play',
  aliases: ['p'],
  description: 'Loads a song from youtube!',
  category: 'AUDIO',
  options: [
    {
      type: 'SUB_COMMAND',
      name: 'song',
      description: 'Loads a single song from a URL',
      options: [
        {
          type: 'STRING',
          name: 'url',
          description: 'The song URL',
          required: true,
        },
      ],
    },
    {
      type: 'SUB_COMMAND',
      name: 'playlist',
      description: 'Loads a playlist from a URL',
      options: [
        {
          type: 'STRING',
          name: 'url',
          description: 'The playlist URL',
          required: true,
        },
      ],
    },
    {
      type: 'SUB_COMMAND',
      name: 'search',
      description: 'Searches for song based on provided keywords',
      options: [
        {
          type: 'STRING',
          name: 'searchterms',
          description: 'The search keywords',
          required: true,
        },
      ],
    },
  ],
  examples: [
    'd.play song https://youtu.be/Cl5Vkd4N03Q?list=RDik2YF05iX2w',
    'd.play playlist https://www.youtube.com/watch?v=Cl5Vkd4N03Q&list=RDik2YF05iX2w&index=3',
    'd.play search after dark',
  ],
  slash: 'both',
  run: async ({ client, interaction, args, message }) => {
    if (!(interaction || message).member.voice.channel)
      return `***You need to be in a voice channel to use this command!***`

    const queue = await client.player.createQueue(
      (interaction || message).guild.id
    )
    if (!queue.connection)
      await queue.join((interaction || message).member.voice.channel)

    shouldSayGoodNight(interaction, message)

    const embed = new CustomMessageEmbed(' ')

    try {
      const subcommand = isInteraction(args) ? args.getSubcommand() : args[0]

      if (subcommand === 'song') {
        const url = isInteraction(args) ? args.getString('url', true) : args[1]

        const song = await queue.play(url, {
          requestedBy: interaction?.user || message?.author,
        })

        if (!song) {
          return `***No result...***`
        }

        embed
          .setDescription(
            `**[${song.name}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      if (subcommand === 'playlist') {
        const url = isInteraction(args) ? args.getString('url', true) : args[1]

        const playlist = await queue.playlist(url, {
          requestedBy: interaction?.user || message?.author,
        })

        if (!playlist.songs.length) {
          return `***No result...***`
        }

        const duration = playlist.songs.reduce(
          (prev, curr) => curr.milliseconds + prev,
          0
        )

        embed
          .setDescription(
            `**${playlist.songs.length} songs from [${playlist.name}](${playlist.url})** has been added to the queue!`
          )
          .setFooter({
            text: `Duration: ${Date.duration(duration, 'milliseconds').format(
              'HH:mm:ss'
            )}`,
          })
      }

      if (subcommand === 'search') {
        const searchterms = isInteraction(args)
          ? args.getString('searchterms', true)
          : args.join(' ')

        const song = await queue.play(searchterms, {
          requestedBy: interaction?.user || message?.author,
        })

        if (!song) {
          return `***No result...***`
        }

        embed
          .setDescription(
            `**[${song.name}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      return embed
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to play your music...***`
    }
  },
})

// Just a joke between friends (when joining play a audio of me saying good night on our guild...)
async function shouldSayGoodNight(
  interaction: ExtendedInteraction,
  message: Message
) {
  if ((interaction || message).guild.id === '750149237357936741') {
    const audio = createAudioResource(
      path.join(__dirname, '..', '..', 'assets', 'boa noite.mp3')
    )

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await queue.connection.playAudioStream(audio)
  }
}
