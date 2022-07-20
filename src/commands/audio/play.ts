import dayjs from 'dayjs'
import { QueryType } from 'discord-player'
import { CommandInteractionOptionResolver } from 'discord.js'

import logger from '@deepz/logger'
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
  slash: 'both',
  run: async ({ client, interaction, args }) => {
    args = args as CommandInteractionOptionResolver
    if (!interaction.member.voice.channel)
      return `***You need to be in a voice channel to use this command!***`

    const queue = await client.player.createQueue(interaction.guild)
    if (!queue.connection) await queue.connect(interaction.member.voice.channel)

    const embed = new CustomMessageEmbed(' ')

    try {
      if (args.getSubcommand() === 'song') {
        const url = args.getString('url', true)

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_VIDEO,
        })

        if (result.tracks.length === 0) {
          return `***No result...***`
        }

        const song = result.tracks[0]

        await queue.addTrack(song)
        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      if (args.getSubcommand() === 'playlist') {
        const url = args.getString('url', true)

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_PLAYLIST,
        })

        if (result.tracks.length === 0) {
          return `***No result...***`
        }

        const playlist = result.playlist
        const duration = playlist.tracks.reduce(
          (prev, curr) => curr.durationMS + prev,
          0
        )

        await queue.addTracks(playlist.tracks)
        embed
          .setDescription(
            `**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the queue!`
          )
          .setThumbnail(playlist.thumbnail)
          .setFooter({
            text: `Duration: ${dayjs(duration).format('DD HH:mm:ss')}`,
          })
      }

      if (args.getSubcommand() === 'search') {
        const url = args.getString('searchterms', true)

        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })

        if (result.tracks.length === 0) {
          return `***No result...***`
        }

        const song = result.tracks[0]

        await queue.addTrack(song)
        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      if (!queue.playing) await queue.play()

      return embed
    } catch (error) {
      logger.error(error)

      return `***Something went wrong trying to play your music...***`
    }
  },
})
