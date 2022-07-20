import { steamToken } from '@deepz/config'
import { IResolveVanityURLResponse } from '@deepz/types/fetchs/steam'

import { request } from './request'

// Credits: https://github.com/12pt/steamid-converter
const BASE_NUM = BigInt('76561197960265728')

const REGEX_STEAMID64 = /^[0-9]{17}$/
const REGEX_STEAMID = /^STEAM_[0-5]:[01]:\d+$/
const REGEX_STEAMID3 = /^\[U:1:[0-9]+\]$/

// Example: .../id/deepzqueen
const STEAMCOMMUNITY_ID_URL = 'steamcommunity.com/id'

// Example: .../profiles/76940218508610
const STEAMCOMMUNITY_PROFILE_URL = 'steamcommunity.com/profiles'

const getApiUrl = (vanityUrl: string) =>
  `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamToken}&vanityurl=${vanityUrl}`

/**
 * It takes a string, checks if it's a SteamID64, SteamID3, SteamID, Steam profile URL, or
 * Steam ID URL, and returns a SteamID64
 * @param {string} dataToSearch - The string you want to convert to a SteamID64.
 * @returns SteamID
 */
export async function getSteamID(dataToSearch: string) {
  if (!dataToSearch || typeof dataToSearch !== 'string')
    throw new Error('I was unable to find a steam profile with that name')

  if (REGEX_STEAMID64.test(dataToSearch)) return dataToSearch

  if (REGEX_STEAMID3.test(dataToSearch))
    dataToSearch = fromSteamID3(dataToSearch)

  if (REGEX_STEAMID.test(dataToSearch)) return toSteamID64(dataToSearch)

  const splitUrl = (url: string) => url.split('/')

  if (dataToSearch.includes(STEAMCOMMUNITY_PROFILE_URL)) {
    const splitted = splitUrl(dataToSearch)
    const id = splitted.pop()

    // if ends with <url>/
    // id === undefined
    return id || splitted.pop()
  }

  if (dataToSearch.includes(STEAMCOMMUNITY_ID_URL)) {
    const splitted = splitUrl(dataToSearch)
    const id = splitted.pop()

    // if ends with <url>/
    // id === undefined
    dataToSearch = id || splitted.pop()
  }

  const body = await request<IResolveVanityURLResponse>(getApiUrl(dataToSearch))

  if (!body.response || body.response.success === 42)
    throw new Error('I was unable to find a steam profile with that name')

  return body.response.steamid
}

/**
 * `(v + z * 2 + y).toString()`
 * @param {string} steamid - The SteamID you want to convert to SteamID64
 * @returns The SteamID64 of the user
 */
function toSteamID64(steamid: string) {
  const split = steamid.split(':')
  const v = BASE_NUM

  const y = BigInt(split[1])
  const z = BigInt(split[2])

  if (!z || !y) return

  return (v + z * BigInt(2) + y).toString()
}

/**
 * `STEAM_0:<Y>:<Z>` is the same as `[U:1:<Z * 2 + Y>]`
 * @param {string} steamid3 - The SteamID3 you want to convert to SteamID64.
 * @returns The SteamID64
 */
function fromSteamID3(steamid3: string) {
  const split = steamid3.split(':')
  const last = parseInt(split[2].substring(0, split[2].length - 1))

  return 'STEAM_0:' + ((last % 2) + ':' + Math.floor(last / 2))
}
