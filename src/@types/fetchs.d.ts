export interface IResolveVanityURLResponse {
  response?: {
    steamid: string
    success: number
  }
}

export interface IGetPlayerSummariesResponse {
  response?: {
    players: PlayerSummary[]
  }
}

export interface IPlayerBansResponse {
  players?: PlayerBan[]
}

interface PlayerBan {
  VACBanned: boolean
  CommunityBanned: boolean
  SteamId: string
  NumberOfVACBans: number
  DaysSinceLastBan: number
  NumberOfGameBans: number
  EconomyBan: string
}

interface PlayerSummary {
  steamid: string
  communityvisibilitystate: number
  profilestate: number
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  avatarhash: string
  lastlogoff: number
  loccountrycode: string
  personastate: number
  realname: string
  primaryclanid: string
  timecreated: number
  personastateflags: number
}
