import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'
import dotenv from 'dotenv'
import { Api, Score } from 'node-osu'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'
import { getScore } from '@utils/osu'

// .env
dotenv.config()

const osuApi = new Api(process.env.OSU_API_KEY, {
  parseNumeric: true,
  notFoundAsError: true,
  completeScores: true,
})

/**
 * * Under development!
 * TODO: Get User Best, Get Beatmap Information
 */
export default class OsuCommand implements Command {
  commandNames = ['osu']
  commandExamples = [
    {
      example: 'd.osu',
      description: 'See your osu profile information',
    },
    {
      example: 'd.osu recentscore',
      description: 'See your most recent play on osu!',
    },
    {
      example: 'd.osu set <username>',
      description: 'Register your osu! account',
    },
  ]

  commandCategory = 'Games'

  commandUsage = 'd.osu [recentscore | set] [username(set)]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}osu to set your osu! settings, get recent plays\nNOTE: Only support standard and under development...`
  }

  async run({ originalMessage, args, bot }: CommandContext): Promise<void> {
    if (!args[0]) {
      try {
        const user = await connection('users')
          .where('id', '=', originalMessage.author.id)
          .first()

        if (!user.osu) {
          originalMessage.channel.send(
            `You have not registered your osu! profile yet! Try \`d.osu set <username>\``
          )
          return
        }

        const { osu } = user

        const embed = await getUserEmbed(osu)

        await originalMessage.channel.send(embed)
        return
      } catch (error) {
        console.error(error)

        await originalMessage.channel.send(
          `**:x: Something went wrong! Please try again later.**`
        )
      }

      return
    }

    if (args[0] === 'rs' || args[0] === 'recent' || args[0] === 'recentscore') {
      try {
        const user = await connection('users')
          .where('id', '=', originalMessage.author.id)
          .first()

        if (!user.osu) {
          originalMessage.channel.send(
            `You have not registered your osu! profile yet! Try \`d.osu set <username>\``
          )
          return
        }

        const { osu } = user

        const [recent] = await osuApi.getUserRecent({ u: osu })
        const osuUser = await osuApi.getUser({ u: recent.user.id })

        const recent_raw = formatRecentRaw(recent)

        await getScore(recent_raw, async (err, score) => {
          if (err) {
            await originalMessage.channel.send(`**:x: ${err.message}**`)
            return
          }

          let description = ''

          const message = new MessageEmbed()
            .setAuthor(
              `${osuUser.name} - ${
                osuUser.pp.raw
              }pp (#${osuUser.pp.rank.toLocaleString()})`,
              `https://s.ppy.sh/a/${score.user_id}`,
              `https://osu.ppy.sh/u/${recent.user.id}`
            )
            .setTitle(
              `${score.artist} - ${score.title} ★${score.stars.toFixed(2)} [${
                score.version
              }]`
            )
            .setURL(`https://osu.ppy.sh/b/${score.beatmap_id}`)
            .setThumbnail(
              `https://b.ppy.sh/thumb/${recent.beatmap.beatmapSetId}l.jpg`
            )

          const emoji = bot.emojis.cache.find(
            (value) => value.name === `${recent.rank}_`
          )

          description += `➤ **${emoji} rank** `

          if (score.pp_fc > score.pp) {
            description += `➤ **${+score.pp.toFixed(
              2
            )}pp (${+score.pp_fc.toFixed(2)}pp for ${+score.acc_fc.toFixed(
              2
            )}% FC)**\n➤ **Accuracy:** ${score.acc.toFixed(2)}%`
          } else {
            description += `➤ **${+score.pp.toFixed(2)}pp**`
          }

          if (score.combo < score.max_combo) {
            description += `\n➤ **${recent.score.toLocaleString()}** ➤ **${
              score.combo
            }/${score.max_combo}x**`
          } else {
            description += `**${score.max_combo}x**`
          }

          if (score.count300 > 0) {
            description += ` ➤ [${score.count300}, `
          }

          if (score.count100 > 0) {
            description += `${score.count100}, `
          }

          if (score.count50 > 0) {
            description += `${score.count50}, `
          }

          if (score.countmiss > 0) {
            description += `${score.countmiss}]`
          }

          if (score.map_completion && score.map_completion !== 100) {
            description += `\n➤ **Map completion:** ${score.map_completion.toFixed(
              2
            )}%`
          }

          message.setDescription(description)

          originalMessage.channel.send(
            `**Most recent play for ${osuUser.name}**`,
            message
          )
        })
      } catch (error) {
        await originalMessage.channel.send(
          `**:x: Something went wrong! Please try again later.**`
        )
      }

      return
    }

    if (args[0] === 'set') {
      try {
        if (!args[1]) {
          await originalMessage.channel.send(
            `**Please provide your username!**`
          )
          return
        }

        const osuPlayer = await osuApi.getUser({ u: args[1], type: 'string' })

        await connection('users')
          .where('id', '=', originalMessage.author.id)
          .update({
            osu: osuPlayer.name,
          })

        originalMessage.channel.send(`**Osu profile registered successfully.**`)
      } catch (error) {
        console.error(error)

        if (error.message === 'Not found') {
          originalMessage.channel.send(`**:x: Player not found...**`)
        } else {
          originalMessage.channel.send(
            `**:x: Something went wrong! Please try again later.**`
          )
        }
      }

      return
    }

    try {
      const embed = await getUserEmbed(args[0])

      originalMessage.channel.send(embed)
    } catch (error) {
      console.error(error)

      originalMessage.channel.send(
        `**:x: Something went wrong! Please try again later.**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

function formatRecentRaw(recent: Score) {
  return {
    user_id: recent.user.id,
    beatmap_id: recent.beatmap.id,
    rank: recent.rank,
    score: recent.score,
    combo: recent.maxCombo,
    count300: recent.counts['300'],
    count100: recent.counts['100'],
    count50: recent.counts['50'],
    countmiss: recent.counts.miss,
    modsNumber: recent.raw_mods,
    modsString: recent.mods,
    date: new Date(recent.date),
    pp: recent.pp,
  }
}

async function getUserEmbed(name: string): Promise<MessageEmbed> {
  try {
    const player = await osuApi.getUser({ u: name, type: 'string' })

    let highScores = ''

    if (player.counts.SSH) {
      highScores += `-> **SSHs:** ${player.counts.SSH}\n`
    }

    if (player.counts.SS) {
      highScores += `-> **SSs:** ${player.counts.SS}\n`
    }

    if (player.counts.SH) {
      highScores += `-> **SHs:** ${player.counts.SH}\n`
    }

    if (player.counts.S) {
      highScores += `-> **Ss:** ${player.counts.S}\n`
    }

    const embed = new MessageEmbed()
      .setAuthor(
        `${player.name} osu! profile`,
        `https://osu.ppy.sh/images/flags/${player.country}.png`
      )
      .setThumbnail(`https://a.ppy.sh/${player.id}`)
      .setDescription(
        stripIndents`-> **Official rank:** #${player.pp.rank} (${
          player.country
        }#${player.pp.countryRank})
  -> **Level:** ${player.level}
  -> **PP:** ${player.pp.raw}
  -> **Hit Accuracy:** ${player.accuracy.toFixed(2)}%
  -> **Playcount:** ${player.counts.plays}
  ${highScores && highScores}`
      )
      .setFooter(`Joined at ${player.raw_joinDate}`)

    return embed
  } catch (error) {
    console.error(error)

    return error
  }
}
