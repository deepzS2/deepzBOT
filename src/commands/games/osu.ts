import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'
import dotenv from 'dotenv'
import JSSoup from 'jssoup'
import { Api, Score, User } from 'node-osu'
import request from 'request-promise-native'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'

const osuBpdpc = require('osu-bpdpc')

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

  commandUsage = 'd.osu'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}osu to set your osu! settings, get recent plays\nNOTE: Only support standard and under development...`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
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

        const message = await getRecent(osu)

        if (message instanceof Error && message.message === 'Not found') {
          await originalMessage.channel.send(`**:x: No recent plays**`)
          return
        }

        await originalMessage.channel.send(message)
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
        console.log(error)

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

async function getRecent(name: string): Promise<MessageEmbed | Error> {
  try {
    const recents = await osuApi.getUserRecent({
      u: name,
      limit: 1,
      type: 'string',
    })

    if (recents.length === 0) {
      return new Error('User has no recent score...')
    }

    const recent = recents[0]

    let mods: string | Array<string> = getMods(recent.raw_mods)

    if (mods.length === 0) {
      mods = []
      mods.push('No Mod')
    } else {
      const oppai_mods = `+${mods.join(' ')}`
      mods = oppai_mods
    }

    const { acc, fc } = await calculateAccAndFc(recent)
    const player = await getUser(name)
    const beatmap_url = `https://osu.ppy.sh/b/${recent.beatmapId}`

    const map_image = await getBeatmapThumb(beatmap_url)

    let pot_pp = ''
    let mapCompletion
    if (recent.rank === 'F') {
      const total_hits =
        recent.counts['50'] +
        recent.counts['100'] +
        recent.counts['300'] +
        recent.counts.miss

      const output = await getPP(
        recent.beatmapId as string,
        recent.raw_mods,
        recent.maxCombo,
        recent.beatmap.maxCombo,
        recent.counts,
        [acc],
        total_hits
      )

      if (output) {
        pot_pp = `**No PP** (${output.pp}PP for ${fc.toFixed(2)}% FC)`
        mapCompletion = output.mapCompletion
      }
    } else {
      const output = await getPP(
        recent.beatmapId as string,
        recent.raw_mods,
        recent.maxCombo,
        recent.beatmap.maxCombo,
        recent.counts,
        [acc]
      )

      if (output) {
        pot_pp = `**${output.pp}PP**`
        mapCompletion = output.mapCompletion
      }
    }

    let desc = `**${
      recent.beatmap.title
    } [${recent.beatmap.difficulty.rating.toFixed(2)}✩] +${mods}**\n`

    desc += `-> **${
      recent.rank
    } Rank** -> ${pot_pp}\n-> **Accuracy:** ${acc.toFixed(2)}%\n`

    desc += `-> **${recent.score}** -> x${recent.maxCombo}/${recent.beatmap.maxCombo} -> [${recent.counts['300']}/${recent.counts['100']}/${recent.counts['50']}/${recent.counts.miss}]\n`

    if (recent.rank === 'F') {
      desc += `-> **Map Completion:** ${mapCompletion.toFixed(2)}%`
    }

    const embed = new MessageEmbed()
      .setTitle(`**${player.name} most recent play**`)
      .setDescription(desc)
      .setAuthor(name, `http://s.ppy.sh/a/${player.id}`)
      .setThumbnail(map_image.replace(/\\/g, ''))
      .setColor('#4360FB')

    return embed
  } catch (error) {
    console.error(error)

    return error
  }
}

function getMods(number: number): Array<string> {
  const mod_list = []

  if (number & (1 << 0)) mod_list.push('NF')
  if (number & (1 << 1)) mod_list.push('EZ')
  if (number & (1 << 3)) mod_list.push('HD')
  if (number & (1 << 4)) mod_list.push('HR')
  if (number & (1 << 5)) mod_list.push('SD')
  if (number & (1 << 9)) mod_list.push('NC')
  else if (number & (1 << 6)) mod_list.push('DT')
  if (number & (1 << 7)) mod_list.push('RX')
  if (number & (1 << 8)) mod_list.push('HT')
  if (number & (1 << 10)) mod_list.push('FL')
  if (number & (1 << 12)) mod_list.push('SO')
  if (number & (1 << 14)) mod_list.push('PF')
  if (number & (1 << 15)) mod_list.push('4 KEY')
  if (number & (1 << 16)) mod_list.push('5 KEY')
  if (number & (1 << 17)) mod_list.push('6 KEY')
  if (number & (1 << 18)) mod_list.push('7 KEY')
  if (number & (1 << 19)) mod_list.push('8 KEY')
  if (number & (1 << 20)) mod_list.push('FI')
  if (number & (1 << 24)) mod_list.push('9 KEY')
  if (number & (1 << 25)) mod_list.push('10 KEY')
  if (number & (1 << 26)) mod_list.push('1 KEY')
  if (number & (1 << 27)) mod_list.push('3 KEY')
  if (number & (1 << 28)) mod_list.push('2 KEY')

  return mod_list
}

function calculateAccAndFc(score: Score): Record<string, number> {
  let total_unscale_score = score.counts[300]
  total_unscale_score += score.counts[100]
  total_unscale_score += score.counts[50]
  total_unscale_score += score.counts.miss
  total_unscale_score *= 300

  let user_score_acc = score.counts[300] * 300
  user_score_acc += score.counts[100] * 100
  user_score_acc += score.counts[50] * 50

  const acc = (user_score_acc / total_unscale_score) * 100

  let user_no_choke_acc = score.counts[300] * 300
  user_no_choke_acc += (score.counts[100] + score.counts.miss) * 100
  user_no_choke_acc += score.counts[50] * 50

  const fc = (user_no_choke_acc / total_unscale_score) * 100

  return { acc, fc }
}

async function getUser(name: string): Promise<User> {
  try {
    const user = await osuApi.getUser({
      u: name,
    })

    return user
  } catch (error) {
    console.error(error)
  }
}

async function getPP(
  map_id: string,
  mods = 0,
  combo: undefined | number = undefined,
  max_combo: number,
  counts: Record<string, number>,
  accs = [100],
  completion: number | undefined = undefined
): Promise<Record<string, unknown>> {
  try {
    const osu = await request.get(`https://osu.ppy.sh/osu/${map_id}`)

    const beatmap = osuBpdpc.Beatmap.fromOsu(osu)

    const score = {
      maxcombo: combo || 0,
      count50: counts['50'],
      count100: counts['100'],
      count300: counts['300'],
      countMiss: counts.miss,
      countKatu: counts.katu,
      countGeki: counts.geki,
      perfect: counts.perfect ? 1 : 0,
      mods,
    }

    const diff = osuBpdpc.Osu.DifficultyCalculator.use(beatmap)
      .setMods(mods)
      .calculate()

    const perf = osuBpdpc.Osu.PerformanceCalculator.use(diff).calculate(score)

    const pp_json = {
      version: perf.beatmap.Version,
      title: perf.beatmap.Metadata.Title,
      artist: perf.beatmap.Metadata.Artist,
      creator: perf.beatmap.Metadata.Creator,
      combo,
      misses: counts.miss,
      max_combo,
      hitObjects: diff.beatmap.HitObjects.length,
      hitCircles: diff.beatmap.HitObjects.filter(
        (value) => value.constructor.name === 'Circle'
      ),
      hitSliders: diff.beatmap.HitObjects.filter(
        (value) => value.constructor.name === 'Slider'
      ),
      hitSpinners: diff.beatmap.HitObjects.filter(
        (value) => value.constructor.name === 'Spinner'
      ),
      stars: perf.starDifficulty.toFixed('2'),
      aimStars: perf.aimDifficulty.toFixed('2'),
      speedDifficulty: perf.speedDifficulty.toFixed('2'),
      pp: perf.totalPerformance.toFixed('2'),
      aimPp: perf.aimPerformance.toFixed('2'),
      speedPp: perf.speedPerformance.toFixed('2'),
      accPp: perf.accuracyPerformance.toFixed('2'),
      accs,
      cs: perf.beatmap.Difficulty.CircleSize,
      hp: perf.beatmap.Difficulty.HPDrainRate,
      ar: perf.beatmap.Difficulty.ApproachRate,
      od: perf.beatmap.Difficulty.OverallDifficulty,
      mapCompletion: undefined,
    }

    if (completion) {
      const hitObj = []

      const numObj = completion - 1
      const num = diff.beatmap.HitObjects.length

      diff.beatmap.HitObjects.forEach((value) => {
        hitObj.push({ start: value.startTime, end: value.endTime })
      })

      const timing = hitObj[num - 1].end - hitObj[0].start
      const point = hitObj[numObj].end - hitObj[0].start

      pp_json.mapCompletion = (point / timing) * 100
    }

    return pp_json
  } catch (error) {
    console.error(error)
  }
}

async function getBeatmapThumb(url: string): Promise<string> {
  const res = await request.get(url)
  const soup = new JSSoup(res)

  const scripts = soup.findAll('script')
  const script = (scripts[scripts.length - 5].text as string).split(
    '"list@2x":"'
  )

  const index = script[1].indexOf('"')

  return script[1].slice(0, index)
}
