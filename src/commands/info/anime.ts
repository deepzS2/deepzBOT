import dayjs from 'dayjs'
import {
  ComponentType,
  SelectMenuBuilder,
  ApplicationCommandOptionType,
} from 'discord.js'

import logger from '@deepz/logger'
import {
  IAnime,
  IAnimeByIdFetchResponse,
  IAnimesFetchResponse,
  IGenre,
  IGenresByAnimeFetchResponse,
} from '@deepz/types/fetchs/kitsu'
import { sendMessage, request, isInteraction } from '@helpers'
import { ExtendedClient, Command, CustomMessageEmbed } from '@structures'

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
      type: ApplicationCommandOptionType.String,
      name: 'searchterm',
      description: 'The anime title to search',
      required: false,
    },
  ],
  examples: ['d.anime boku no...'],
  slash: 'both',
  run: async ({ client, interaction, args }) => {
    try {
      const searchTerm = isInteraction(args)
        ? args.getString('searchterm')
        : args.join(' ')

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

      const { data: animes } = await request<IAnimesFetchResponse>(
        `${URL}/anime?filter[text]=${searchTerm}`
      )

      const selectAnimeMenu = new SelectMenuBuilder()
        .setCustomId('select_anime_menu')
        .setPlaceholder('Choose an anime present on the list!')
        .addOptions(
          animes.map((anime) => ({
            label:
              anime.attributes.titles.en ||
              anime.attributes.titles.en_jp ||
              anime.attributes.titles.ja_jp,
            value: anime.id,
            default: false,
          }))
        )

      const selectMessage = await sendMessage({
        message: interaction,
        content: {
          embeds: [createAnimeSelectList(animes, client)],
          components: [
            {
              type: ComponentType.ActionRow,
              components: [selectAnimeMenu],
            },
          ],
        },
      })

      // TODO: Search anime by title and display the choices
      const collector = selectMessage.createMessageComponentCollector({
        time: 10000,
      })

      collector.on('collect', async (collected) => {
        if (
          collected.isSelectMenu() &&
          collected.customId === 'select_anime_menu' &&
          collected.values.length
        ) {
          await collected.deferUpdate()

          const value = collected.values[0]
          const animeSelected = animes.find((anime) => anime.id === value)

          const { data: genres } = await request<IGenresByAnimeFetchResponse>(
            animeSelected.relationships.genres.links.related
          )

          selectMessage.edit({
            embeds: [createAnimeEmbed(animeSelected, genres, client)],
            components: [],
          })
        }
      })

      collector.on('end', async (collected) => {
        if (!collected.size && selectMessage.deletable) {
          await selectMessage.delete()
        }
      })
    } catch (error) {
      logger.error(error)
      return `***Something went wrong getting the anime data!***`
    }
  },
})

function createAnimeSelectList(animes: IAnime[], client: ExtendedClient) {
  return new CustomMessageEmbed('Select an anime!', {
    description: `Type the number present on the list or type \`exit\` if no results are found!`,
    author: {
      name: 'List of animes search result!',
      iconURL: client.user.displayAvatarURL(),
    },
  }).addFields(
    animes.map((anime, index) => {
      return {
        name: `${convertToEmoji(index)} ${
          anime.attributes.titles.en || anime.attributes.titles.en_jp
        }`,
        value: anime.attributes.titles.ja_jp,
      }
    })
  )
}

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
  ).addFields([
    {
      name: 'Type',
      value: anime.attributes.showType,
      inline: true,
    },
    {
      name: 'Current status',
      value: anime.attributes.status,
      inline: true,
    },
    {
      name: 'Aired from',
      value: `${dayjs(anime.attributes.startDate).format(
        'MM/DD/YYYY'
      )} to ${dayjs(anime.attributes.endDate).format('MM/DD/YYYY')}`,
    },
    {
      name: 'Genres',
      value: genres.map((genre) => genre.attributes.name).join(', '),
      inline: true,
    },
  ])

  if (anime.attributes.showType !== 'movie') {
    embed.addFields({
      name: 'Episodes',
      value: `${anime.attributes.episodeCount} episodes with ${anime.attributes.episodeLength} minutes per episode`,
      inline: true,
    })
  } else {
    embed.addFields({
      name: 'Movie length',
      value: `${anime.attributes.episodeLength} minutes`,
      inline: true,
    })
  }

  return embed
}

function convertToEmoji(index) {
  let number = ''
  switch (index) {
    case 0:
      number = ':one:'
      break

    case 1:
      number = ':two:'
      break

    case 2:
      number = ':three:'
      break

    case 3:
      number = ':four:'
      break

    case 4:
      number = ':five:'
      break

    case 5:
      number = ':six:'
      break

    case 6:
      number = ':seven:'
      break

    case 7:
      number = ':eight:'
      break

    case 8:
      number = ':nine:'
      break

    case 9:
      number = ':keycap_ten:'
      break
  }

  return number
}
