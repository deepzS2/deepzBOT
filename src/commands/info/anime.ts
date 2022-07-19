import dayjs from 'dayjs'
import { CommandInteractionOptionResolver } from 'discord.js'

import logger from '@deepz/logger'
import {
  IAnime,
  IAnimeByIdFetchResponse,
  IGenre,
  IGenresByAnimeFetchResponse,
} from '@deepz/types/fetchs/kitsu'
import request from '@helpers/request'
import { ExtendedClient } from '@structures/Client'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

// https://kitsu.docs.apiary.io/
const URL = `https://kitsu.io/api/edge`
const ANIMES_NUMBER = 15268
const INVALID_PROPS_MESSAGE = `***Anime with invalid properties... Try again!***`

export default new Command({
  name: 'anime',
  description: 'Search for a specific anime or a random one!',
  category: 'INFO',
  options: [
    {
      type: 'STRING',
      name: 'searchterm',
      description: 'The anime title to search',
      required: false,
    },
  ],
  slash: 'both',
  run: async ({ client, args }) => {
    try {
      const interactionArgs = args as CommandInteractionOptionResolver
      const searchTerm = interactionArgs.getString('searchterm')

      if (!searchTerm) {
        const id = Math.floor(Math.random() * ANIMES_NUMBER)

        const { data: anime } = await request<IAnimeByIdFetchResponse>(
          `${URL}/anime/${id}`
        )

        if (!anime) return INVALID_PROPS_MESSAGE

        const { data: genres } = await request<IGenresByAnimeFetchResponse>(
          anime.relationships.genres.links.related
        )

        if (!genres) return INVALID_PROPS_MESSAGE

        return createAnimeEmbed(anime, genres, client)
      }

      // TODO: Search anime by title and display the choices
    } catch (error) {
      logger.error(error)
      return `***Something went wrong getting the anime data!***`
    }
  },
})

function createAnimeEmbed(
  anime: IAnime,
  genres: IGenre[],
  client: ExtendedClient
) {
  const embed = new CustomMessageEmbed(
    `**${anime.attributes.titles.en || anime.attributes.titles.en_jp || ''} ${
      anime.attributes.titles.ja_jp
    }**`,
    {
      author: {
        name: 'Your anime result!',
        iconURL: client.user.displayAvatarURL(),
      },
      description: anime.attributes.synopsis,
      color: '#4360fb',
      thumbnail: anime.attributes.posterImage.original,
      footer: {
        text: `${anime.attributes.averageRating ?? 0}% rating by ${
          anime.attributes.userCount
        } users`,
      },
    }
  )
    .addField('Type', anime.attributes.showType, true)
    .addField('Current status', anime.attributes.status, true)
    .addField(
      'Aired from',
      `${dayjs(anime.attributes.startDate).format('MM/DD/YYYY')} to ${dayjs(
        anime.attributes.endDate
      ).format('MM/DD/YYYY')}`
    )
    .addField(
      'Genres',
      genres.map((genre) => genre.attributes.name).join(', '),
      true
    )

  if (anime.attributes.showType !== 'movie') {
    embed.addField(
      'Episodes',
      `${anime.attributes.episodeCount} episodes with ${anime.attributes.episodeLength} minutes per episode`,
      true
    )
  } else {
    embed.addField(
      'Movie length',
      `${anime.attributes.episodeLength} minutes`,
      true
    )
  }

  return embed
}
