import fetch from 'node-fetch'

import { IResolveVanityURLResponse } from '@myTypes'
import { steamToken } from '@root/config'

// Credits: https://github.com/12pt/steamid-converter
const BASE_NUM = BigInt('76561197960265728')

const REGEX_STEAMID64 = /^[0-9]{17}$/
const REGEX_STEAMID = /^STEAM_[0-5]:[01]:\d+$/
const REGEX_STEAMID3 = /^\[U:1:[0-9]+\]$/

// Example: .../id/deepzqueen
const STEAMCOMMUNITY_ID_URL = 'steamcommunity.com/id'

// Example: .../profiles/76940218508610
const STEAMCOMMUNITY_PROFILE_URL = 'steamcommunity.com/profiles'

const URL = (vanityUrl: string) =>
  `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamToken}&vanityurl=${vanityUrl}`

export default async function getSteamID(dataToSearch: string) {
  if (!dataToSearch || typeof dataToSearch !== 'string')
    throw new Error('I was unable to find a steam profile with that name')

  if (REGEX_STEAMID64.test(dataToSearch)) return dataToSearch

  if (REGEX_STEAMID3.test(dataToSearch))
    dataToSearch = fromSteamID3(dataToSearch)

  if (REGEX_STEAMID.test(dataToSearch)) return toSteamID64(dataToSearch)

  if (dataToSearch.includes(STEAMCOMMUNITY_PROFILE_URL)) {
    return dataToSearch.split('/').pop()
  }

  if (dataToSearch.includes(STEAMCOMMUNITY_ID_URL)) {
    dataToSearch = dataToSearch.split('/').pop()
  }

  const body: IResolveVanityURLResponse = await fetch(URL(dataToSearch)).then(
    (res) => res.json()
  )

  if (!body.response || body.response.success === 42)
    throw new Error('I was unable to find a steam profile with that name')

  return body.response.steamid
}

function toSteamID64(steamid: string) {
  const split = steamid.split(':')
  const v = BASE_NUM

  const y = BigInt(split[1])
  const z = BigInt(split[2])

  if (!z || !y) return

  return (v + z * BigInt(2) + y).toString()
}

function fromSteamID3(steamid3: string) {
  const split = steamid3.split(':')
  const last = parseInt(split[2].substring(0, split[2].length - 1))

  return 'STEAM_0:' + ((last % 2) + ':' + Math.floor(last / 2))
}
