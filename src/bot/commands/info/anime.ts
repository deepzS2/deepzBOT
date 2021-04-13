import axios from 'axios'
import Discord, { MessageEmbed, Message, Client } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class AnimeCommand implements Command {
  commandNames = ['anime']
  commandExamples = [
    {
      example: 'd.anime hibike',
      description: 'Search the best anime - my owner, deepz, said that',
    },
    {
      example: 'd.anime',
      description: 'Search an random anime for you',
    },
  ]

  commandCategory = 'Info'

  commandUsage = 'd.anime [title]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}anime to search an anime.`
  }

  async run({ bot, originalMessage, args }: CommandContext): Promise<void> {
    const animes = 15268

    if (args.length === 0) {
      // Random anime
      const id = Math.floor(Math.random() * animes)

      // Anime informations
      const {
        data: {
          data: {
            attributes: {
              synopsis,
              // eslint-disable-next-line camelcase
              titles: { en, ja_jp, en_jp },
              startDate,
              endDate,
              episodeCount,
              userCount,
              episodeLength,
              totalLength,
              averageRating,
              status,
              showType,
              posterImage: { medium },
            },
          },
        },
      } = await axios.get(`https://kitsu.io/api/edge/anime/${id}`)

      // Genres
      const {
        data: { data },
      } = await axios.get(`https://kitsu.io/api/edge/anime/${id}/genres`)

      const genres = data
        .map((value) => {
          return value.attributes.name
        })
        .join(', ')

      const embed = new MessageEmbed()
        .setDescription(synopsis)
        .setColor('#4360fb')
        .setThumbnail(medium)
        .setAuthor('Your anime result!', bot.user.displayAvatarURL())
        // eslint-disable-next-line camelcase
        .setTitle(`**${en || en_jp || ''} | ${ja_jp}**`)
        .addField('Episodes', episodeCount, true)
        .addField('Type', showType, true)
        .addField('Status', status, true)
        .addField('Duration', `${episodeLength} minutes per episode`, true)
        .addField('Total Duration', `${totalLength} minutes`)
        .addField('Aired', `from ${startDate} to ${endDate}`)
        .addField(
          'Average Rating',
          `Rated ${averageRating}% by ${userCount} users`,
          true
        )
        .addField('Genres', genres, true)

      originalMessage.channel.send(embed)
      return
    }

    // Anime results
    const {
      data: {
        data,
        meta: { count },
        links: { next },
      },
    } = await axios.get(
      `https://kitsu.io/api/edge/anime?filter[text]=${args[0]}`
    )

    await createSelection(bot, originalMessage, data, count, next, 10)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

async function createSelection(
  bot: Client,
  message: Message,
  data,
  count,
  nextpage,
  actual
) {
  const embed = new MessageEmbed()
    .setDescription(`React with a number or type \`exit\` to close menu`)
    .setTitle('Select an anime!')
    .setAuthor('List of animes search result!', bot.user.displayAvatarURL())

  addOptions(embed, data)

  const selection = await message.channel.send(embed)

  await selection.react('❌')

  const collector = new Discord.MessageCollector(
    message.channel as Discord.TextChannel,
    (m) => m.author.id === message.author.id,
    {
      time: 15000,
    }
  )

  if (actual < count) {
    await selection.react('▶️')
    const reacts = ['❌', '▶️']

    const reaction = new Discord.ReactionCollector(
      selection,
      (react, user) => {
        return (
          user.id === message.author.id && reacts.includes(react.emoji.name)
        )
      },
      {
        time: 15000,
        max: 1,
      }
    )

    reaction.on('collect', async (react) => {
      if (react.emoji.name === '❌') {
        await selection.delete()
        collector.stop()
      } else if (react.emoji.name === '▶️') {
        await selection.delete()
        await collector.stop()
        const response = await axios.get(nextpage)
        await createSelection(
          bot,
          message,
          response.data.data,
          count,
          response.data.links.next,
          actual + 10
        )
      }
    })

    collector.on('collect', async (m) => {
      if (isNaN(Number(m.content))) {
        return message.channel.send(`**Please provide a number of the list**`)
      } else if (m.author.id !== message.author.id) {
        return
      }

      const number = Number(m.content - 1)
      const result = new Discord.MessageEmbed()

      const anime = data[number]

      await selection.delete()
      await m.delete()
      await showAnime(anime, result, bot)

      collector.stop()
      return message.channel.send(result)
    })
  } else {
    const reaction = new Discord.ReactionCollector(
      selection,
      (react, user) => {
        return user.id === message.author.id && react.emoji.name === '❌'
      },
      {
        time: 15000,
        max: 1,
      }
    )

    reaction.on('collect', async (react) => {
      if (react.emoji.name === '❌') {
        await selection.delete()
        collector.stop()
      }
    })

    reaction.on('end', async () => {
      await selection.delete()
      collector.stop()
      return message.channel.send(
        `:negative_squared_cross_mark:   |  ${message.author.username}, the command menu has closed due to inactivity.`
      )
    })

    collector.on('collect', async (m: Message) => {
      try {
        if (isNaN(Number(m.content))) {
          message.channel.send(`Please send a number!`)
          return
        } else if (m.author.id !== message.author.id) {
          return
        }

        const number = Number(m.content) - 1
        const result = new Discord.MessageEmbed()

        const anime = data[number]

        await selection.delete()
        await m.delete()
        await showAnime(anime, result, bot)

        collector.stop()
        return message.channel.send(result)
      } catch (error) {
        console.error(error)
        return message.channel.send(
          `Something went wrong! Please try again later.`
        )
      }
    })
  }
}

function addOptions(embed, data) {
  data.forEach((value, index) => {
    const number = convertToWord(index)

    embed.addField(
      `${number} ${
        value.attributes.titles.en || value.attributes.titles.en_jp
      }`,
      value.attributes.titles.ja_jp
    )
  })
}

async function showAnime(data, embed, bot) {
  const {
    id,
    attributes: {
      synopsis,
      // eslint-disable-next-line camelcase
      titles: { en, ja_jp, en_jp },
      startDate,
      endDate,
      episodeCount,
      userCount,
      episodeLength,
      totalLength,
      averageRating,
      status,
      showType,
      posterImage: { medium },
    },
  } = data

  const genres = await axios.get(`https://kitsu.io/api/edge/anime/${id}/genres`)

  // eslint-disable-next-line camelcase
  const all_genres = genres.data.data
    .map((value) => {
      return value.attributes.name
    })
    .join(', ')

  embed
    .setDescription(synopsis)
    .setColor('#4360fb')
    .setThumbnail(medium)
    .setAuthor('Your anime result!', bot.user.displayAvatarURL())
    // eslint-disable-next-line camelcase
    .setTitle(`**${en || en_jp || ''} | ${ja_jp}**`)
    .addField('Episodes', episodeCount, true)
    .addField('Type', showType, true)
    .addField('Status', status, true)
    .addField('Duration', `${episodeLength} minutes per episode`, true)
    .addField('Total Duration', `${totalLength} minutes`)
    .addField('Aired', `from ${startDate} to ${endDate}`)
    .addField(
      'Average Rating',
      `Rated ${averageRating}% by ${userCount} users`,
      true
    )
    .addField('Genres', all_genres, true)
}

function convertToWord(index) {
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
