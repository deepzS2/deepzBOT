import { Player, Queue } from 'discord-music-player'
import {
  ApplicationCommandOptionType,
  MessagePayload,
  PermissionFlagsBits,
} from 'discord.js'
import { inject } from 'inversify'
import path from 'path'

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

  async run({
    interaction,
    args,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    if (!interaction.member.voice.channel)
      return `***You need to be in a voice channel to use this command!***`

    const queue = await this._player.createQueue(interaction.guild.id)

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

      await queue.join(voiceChannel)
    }

    await this.shouldSayGoodNight(interaction, queue)

    const embed = new CustomMessageEmbed(' ')

    try {
      const subcommand = args.getSubcommand()

      if (subcommand === 'song') {
        const url = args.getString('url', true)

        const song = await queue.play(url, {
          requestedBy: interaction?.user,
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
        const url = args.getString('url', true)

        const playlist = await queue.playlist(url, {
          requestedBy: interaction?.user,
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
        const searchterms = args.getString('searchterms', true)

        const song = await queue.play(searchterms, {
          requestedBy: interaction?.user,
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
      this._logger.error(error)

      return `***Something went wrong trying to play your music...***`
    }
  }

  // Just a joke between friends (when joining play a audio of me saying good night on our guild...)
  private async shouldSayGoodNight(
    interaction: ExtendedInteraction,
    queue: Queue
  ) {
    if (interaction.guild.id === '750149237357936741' && !queue.isPlaying) {
      const audio = createAudioResource(
        path.join(__dirname, '..', '..', 'assets', 'boa noite.mp3')
      )

      await queue.connection.playAudioStream(audio)
    }
  }
}
