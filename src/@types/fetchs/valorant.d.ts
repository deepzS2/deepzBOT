export interface IDefaultResponse<T = any> {
  status: number
  data: T
}

export type IGetAccountResponse = IDefaultResponse<{
  puuid: string
  region: 'na' | 'eu' | 'ap' | 'kr'
  account_level: number
  name: string
  tag: string
  card: {
    small: string
    large: string
    wide: string
    id: string
  }
  last_update: 'Now' | string
}>

export type IGetMMRResponse = IDefaultResponse<{
  currenttier: string
  currenttierpatched: string
  ranking_in_tier: string
  mmr_change_to_last_game: string
  elo: string
  name: string
  tag: string
  old: boolean
}>

export type IGetMMRHistoryResponse = IDefaultResponse<
  Array<{
    currenttier: number
    currenttierpatched: string
    ranking_in_tier: number
    mmr_change_to_last_game: number
    elo: number
    date: string
    date_raw: number
  }>
>
