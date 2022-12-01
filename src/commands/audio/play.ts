import { Player, Queue } from 'discord-player'
import {
  ApplicationCommandOptionType,
  MessagePayload,
  PermissionFlagsBits,
} from 'discord.js'
import { inject } from 'inversify'
import path from 'path'
import playdl from 'play-dl'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { ExtendedInteraction, RunOptions } from '@deepz/types/index'
import { createAudioResource } from '@discordjs/voice'

@Command({
  name: 'play',
  description: 'Loads a song from youtube!',
  category: 'AUDIO',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'song',
      description: 'Loads a single song from a URL',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'url',
          description: 'The song URL',
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'playlist',
      description: 'Loads a playlist from a URL',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'url',
          description: 'The playlist URL',
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'search',
      description: 'Searches for song based on provided keywords',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'searchterms',
          description: 'The search keywords',
          required: true,
        },
      ],
    },
  ],
})
export default class PlayCommand extends BaseCommand {
  @inject(Player) private readonly _player: Player

  private readonly YOUTUBE_VIDEO_URL_REGEX =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/gm
  private readonly YOUTUBE_PLAYLIST_URL_REGEX =
    /^.*(youtu.be\/|list=)([^#&?]*).*/gm

  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    if (!interaction.member.voice.channel)
      return `***You need to be in a voice channel to use this command!***`

    const queue = await this._player.createQueue(interaction.guild.id, {
      async onBeforeCreateStream(track, source) {
        if (source === 'youtube') {
          const result = await playdl.stream(track.url, {
            discordPlayerCompatibility: true,
          })

          return result.stream
        }
      },
    })

    if (!queue.connection) {
      const voiceChannel = interaction.member.voice.channel

      if (!voiceChannel.joinable)
        return `***I don't have permission to join this channel...***`

      if (
        !voiceChannel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionFlagsBits.Speak)
      )
        return `***I don't have permission to speak...***`

      await queue.connect(voiceChannel)
    }

    await this.shouldSayGoodNight(interaction, queue)

    const embed = new CustomMessageEmbed(' ')

    try {
      const subcommand = args.getSubcommand()

      if (subcommand === 'song') {
        const url = args.getString('url', true)

        if (!this.YOUTUBE_VIDEO_URL_REGEX.test(url)) {
          return `***Youtube Video URL invalid...***`
        }

        const { tracks } = await this._player.search(url, {
          requestedBy: interaction.user,
        })

        this._logger.info({ tracks })

        if (!tracks.length) {
          return `***No result...***`
        }

        const song = tracks[0]
        await queue.play(song)

        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      if (subcommand === 'playlist') {
        const url = args.getString('url', true)

        if (!this.YOUTUBE_PLAYLIST_URL_REGEX.test(url)) {
          return `***Youtube Playlist URL invalid...***`
        }

        const { playlist } = await this._player.search(url, {
          requestedBy: interaction.user,
        })

        this._logger.info({ playlist })

        if (!playlist?.tracks?.length) {
          return `***No result...***`
        }

        await queue.play(playlist.tracks[0])
        await queue.addTracks(playlist.tracks)

        const duration = playlist.tracks.reduce(
          (prev, curr) => curr.durationMS + prev,
          0
        )

        embed
          .setDescription(
            `**${playlist.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the queue!`
          )
          .setFooter({
            text: `Duration: ${Date.duration(duration, 'milliseconds').format(
              'HH:mm:ss'
            )}`,
          })
      }

      if (subcommand === 'search') {
        const searchterms = args.getString('searchterms', true)

        const { tracks } = await this._player.search(searchterms, {
          requestedBy: interaction.user,
        })

        if (!tracks.length) {
          return `***No result...***`
        }

        const song = tracks[0]

        await queue.play(song)

        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue!`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` })
      }

      return embed
    } catch (error) {
      this._logger.error(error)

      return `***Something went wrong trying to play your music...***`
    }
  }

  // Just a joke between friends (when joining play a audio of me saying good night on our guild...)
  private async shouldSayGoodNight(
    interaction: ExtendedInteraction,
    queue: Queue
  ) {
    new Promise((resolve, reject) => {
      if (interaction.guild.id === '750149237357936741' && !queue.playing) {
        const audio = createAudioResource(
          path.join(__dirname, '..', '..', 'assets', 'boa noite.mp3')
        )

        queue.connection
          .playStream(audio)
          .then((stream) => {
            stream.on('finish', resolve)
            stream.on('error', reject)
          })
          .catch(reject)
      }
    })
  }
}
