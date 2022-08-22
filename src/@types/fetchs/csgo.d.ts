interface ISearchSteamUserData {
  platformId: number
  platformSlug: string
  platformUserIdentifier: string
  platformUserId: string
  platformUserHandle: string
  avatarUrl: string
  status: unknown
  additionalParameters: unknown
}

interface ISegment {
  rank: null
  percentile: number
  displayName: string
  displayCategory: string
  category: string
  metadata: Record<string, unknown>
  value: number
  displayValue: string
  displayType: string
}

interface ICsUserData {
  type: string
  attributes: Record<string, unknown>
  metadata: {
    name: string
  }
  expiryDate: string
  stats: {
    timePlayed: ISegment
    score: ISegment
    kills: ISegment
    deaths: ISegment
    kd: ISegment
    damage: ISegment
    headshots: ISegment
    dominations: ISegment
    shotsFired: ISegment
    shotsHit: ISegment
    shotsAccuracy: ISegment
    snipersKilled: ISegment
    dominationOverkills: ISegment
    dominationRevenges: ISegment
    bombsPlanted: ISegment
    bombsDefused: ISegment
    moneyEarned: ISegment
    hostagesRescued: ISegment
    mvp: ISegment
    wins: ISegment
    ties: ISegment
    matchesPlayed: ISegment
    losses: ISegment
    roundsPlayed: ISegment
    roundsWon: ISegment
    headshotPct: ISegment
    wlPercentage: ISegment
  }
}

export interface ISearchSteamUserResponse {
  data: ISearchSteamUserData[]
}

export interface ICsUserDataResponse {
  data: {
    segments: ICsUserData[]
    expiryDate: string
  }
}
