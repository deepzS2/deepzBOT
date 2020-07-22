/* eslint-disable new-cap */
import request from 'request-promise-native'

// eslint-disable-next-line import-helpers/order-imports
import { parser } from 'ojsama'

// require because one declaration file is wrong on the module!
const osu = require('ojsama')

const ar_ms_step1 = 120
const ar_ms_step2 = 150

const ar0_ms = 1800
const ar5_ms = 1200
const ar10_ms = 450

const od_ms_step = 6
const od0_ms = 79.5
const od10_ms = 19.5

const DIFF_MODS = ['HR', 'EZ', 'DT', 'HT']

const mods_enum = {
  '': 0,
  NF: 1,
  EZ: 2,
  TD: 4,
  HD: 8,
  HR: 16,
  SD: 32,
  DT: 64,
  RX: 128,
  HT: 256,
  NC: 512,
  FL: 1024,
  AT: 2048,
  SO: 4096,
  AP: 8192,
  PF: 16384,
  '4K': 32768,
  '5K': 65536,
  '6K': 131072,
  '7K': 262144,
  '8K': 524288,
  FI: 1048576,
  RD: 2097152,
  LM: 4194304,
  '9K': 16777216,
  '10K': 33554432,
  '1K': 67108864,
  '3K': 134217728,
  '2K': 268435456,
  V2: 536870912,
}

interface RecentRaw {
  user_id: string
  beatmap_id: string
  rank: string
  score: number
  combo: number
  count300: number
  count100: number
  count50: number
  countmiss: number
  modsNumber: number
  modsString: string[] | string
  date: Date
  pp: number
}

interface Recent {
  user_id: string
  beatmap_id: string
  rank: string
  combo: number
  count300: number
  count100: number
  count50: number
  countmiss: number
  mods: string[] | string
  date: Date
  pp: number
  approved: number
  beatmapset_id: number
  artist: string
  title: string
  version: string
  bpm_min: number
  bpm_max: number
  max_combo: number
  bpm: number
  creator: string
  creator_id: number
  approved_date: Date
  cs: number
  ar: number
  od: number
  hp: number
  duration: number
  fail_percent: number
  stars: number
  pp_fc: number
  acc: number
  acc_fc: number
  map_completion: number
}

interface Callback {
  (error: Error | null, score?: Recent | undefined)
}

export async function getScore(
  recent_raw: RecentRaw,
  cb: Callback
): Promise<void> {
  let recent: Recent

  recent = Object.assign(
    {
      user_id: recent_raw.user_id,
      beatmap_id: recent_raw.beatmap_id,
      rank: recent_raw.rank,
      combo: recent_raw.combo,
      count300: recent_raw.count300,
      count100: recent_raw.count100,
      count50: recent_raw.count50,
      countmiss: recent_raw.countmiss,
      mods: recent_raw.modsNumber,
      date: recent_raw.date,
    },
    recent
  )

  if ('pp' in recent_raw && Number(recent_raw.pp) > 0) {
    recent = Object.assign(
      {
        pp: recent_raw.pp,
      },
      recent
    )
  }

  request
    .get(`https://osu.lea.moe/b/${recent_raw.beatmap_id}`, { json: true })
    .then(async (res) => {
      const beatmap = res.beatmap

      const diff_settings = calculateCsArOdHp(
        beatmap.cs,
        beatmap.ar,
        beatmap.od,
        beatmap.hp,
        recent_raw.modsString
      )

      let speed = 1

      if (recent_raw.modsString.includes('DT')) speed *= 1.5
      else if (recent_raw.modsString.includes('HT')) speed *= 0.75

      let fail_percent = 1

      if (recent_raw.rank === 'F')
        fail_percent =
          (recent.count300 +
            recent.count100 +
            recent.count50 +
            recent.countmiss) /
          beatmap.hit_objects

      recent = Object.assign(
        {
          approved: beatmap.approved,
          beatmapset_id: beatmap.beatmapset_id,
          artist: beatmap.artist,
          title: beatmap.title,
          version: beatmap.version,
          bpm_min: beatmap.bpm_min * speed,
          bpm_max: beatmap.bpm_max * speed,
          max_combo: beatmap.max_combo,
          bpm: beatmap.bpm * speed,
          creator: beatmap.creator,
          creator_id: beatmap.creator_id,
          approved_date: beatmap.approved_date,
          cs: diff_settings.cs,
          ar: diff_settings.ar,
          od: diff_settings.od,
          hp: diff_settings.hp,
          duration: beatmap.total_length,
          fail_percent: fail_percent,
        },
        recent
      )

      const diff =
        res.difficulty[
          getModsEnum(
            (recent_raw.modsString as string[]).filter((mod) =>
              DIFF_MODS.includes(mod)
            )
          )
        ]

      if (diff.aim && diff.speed) {
        let map_completion = 0

        try {
          const beatmapData = await getBeatmap(recent_raw.beatmap_id)
          const parser = new osu.parser().feed(beatmapData)

          const totalhits =
            recent_raw.count300 +
            recent_raw.count100 +
            recent_raw.count50 +
            recent_raw.countmiss

          map_completion = await mapCompletion(parser, totalhits)
        } catch (error) {
          console.error(error)
          cb(
            new Error(
              'Something went wrong while loading the map! Please try again later!'
            )
          )
          return
        }

        const pp = osu.ppv2({
          aim_stars: diff.aim,
          speed_stars: diff.speed,
          base_ar: beatmap.ar,
          base_od: beatmap.od,
          n100: recent_raw.count100,
          n50: recent_raw.count50,
          mods: recent_raw.modsNumber,
          combo: recent_raw.combo,
          ncircles: beatmap.num_circles,
          nsliders: beatmap.num_sliders,
          nobjects: beatmap.hit_objects,
          max_combo: beatmap.max_combo,
          nmiss: recent_raw.countmiss,
        })

        const pp_fc = osu.ppv2({
          aim_stars: diff.aim,
          speed_stars: diff.speed,
          base_ar: beatmap.ar,
          base_od: beatmap.od,
          n100: recent_raw.count100,
          n50: recent_raw.count50,
          mods: recent_raw.modsNumber,
          ncircles: beatmap.num_circles,
          nsliders: beatmap.num_sliders,
          nobjects: beatmap.hit_objects,
          max_combo: beatmap.max_combo,
        })

        recent = Object.assign(
          {
            stars: diff.total,
            pp_fc: pp_fc.total,
            acc: pp.computed_accuracy.value() * 100,
            acc_fc: pp_fc.computed_accuracy.value() * 100,
            map_completion,
          },
          recent
        )

        if (!('pp' in recent)) {
          ;(recent as Recent).pp = pp.total
        }
      } else {
        cb(
          new Error('No difficulty data for this map! Please try again later.')
        )

        return
      }

      cb(null, recent)
    })
    .catch((err) => {
      console.error(err)

      cb(
        new Error(
          "Map not in the database, maps that are too new don't work yet"
        )
      )
    })
}

function calculateCsArOdHp(
  cs_raw: number,
  ar_raw: number,
  od_raw: number,
  hp_raw: number,
  mods_enabled: string[] | string
): Record<string, number> {
  let speed = 1
  let ar_multiplier = 1
  let ar
  let ar_ms

  if (mods_enabled.includes('DT')) {
    speed *= 1.5
  } else if (mods_enabled.includes('HT')) {
    speed *= 0.75
  }

  if (mods_enabled.includes('HR')) {
    ar_multiplier *= 1.4
  } else if (mods_enabled.includes('EZ')) {
    ar_multiplier *= 0.5
  }

  ar = ar_raw * ar_multiplier

  if (ar <= 5) ar_ms = ar0_ms - ar_ms_step1 * ar
  else ar_ms = ar5_ms - ar_ms_step2 * (ar - 5)

  if (ar_ms < ar10_ms) ar_ms = ar10_ms
  if (ar_ms > ar0_ms) ar_ms = ar0_ms

  ar_ms /= speed

  if (ar <= 5) ar = (ar0_ms - ar_ms) / ar_ms_step1
  else ar = 5 + (ar5_ms - ar_ms) / ar_ms_step2

  let cs
  let cs_multiplier = 1

  if (mods_enabled.includes('HR')) {
    cs_multiplier *= 1.3
  } else if (mods_enabled.includes('EZ')) {
    cs_multiplier *= 0.5
  }

  cs = cs_raw * cs_multiplier

  if (cs > 10) cs = 10

  let od
  let odms
  let od_multiplier = 1

  if (mods_enabled.includes('HR')) {
    od_multiplier *= 1.4
  } else if (mods_enabled.includes('EZ')) {
    od_multiplier *= 0.5
  }

  od = od_raw * od_multiplier
  odms = od0_ms - Math.ceil(od_ms_step * od)
  odms = Math.min(od0_ms, Math.max(od10_ms, odms))

  odms /= speed

  od = (od0_ms - odms) / od_ms_step

  let hp
  let hp_multiplier = 1

  if (mods_enabled.includes('HR')) {
    hp_multiplier *= 1.4
  } else if (mods_enabled.includes('EZ')) {
    hp_multiplier *= 0.5
  }

  hp = hp_raw * hp_multiplier

  if (hp > 10) hp = 10

  return {
    cs: cs,
    ar: ar,
    od: od,
    hp: hp,
  }
}

function getModsEnum(mods) {
  let return_value = 0
  mods.forEach((mod) => {
    return_value |= mods_enum[mod.toUpperCase()]
  })
  return return_value
}

async function mapCompletion(beatmap: parser, totalhits = 0) {
  try {
    const hitobj = []

    if (totalhits === 0) {
      totalhits = beatmap.map.objects.length
    }

    const numobj = totalhits - 1
    const num = beatmap.map.objects.length

    beatmap.map.objects.forEach((value) => {
      hitobj.push(value.time)
    })

    const timing = hitobj[num - 1] - hitobj[0]
    const point = hitobj[numobj] - hitobj[0]

    const map_completion = (point / timing) * 100

    return map_completion
  } catch (error) {
    console.error(error)
  }
}

function getBeatmap(beatmap_id: string) {
  return new Promise((resolve, reject) => {
    request
      .get(`https://osu.ppy.sh/osu/${beatmap_id}`)
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
