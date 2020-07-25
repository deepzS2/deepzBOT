export interface User {
  id: string
  username: string
  background_image: string | null
  bio: string | null
  reputation: number
  balance: number
  xp: number
  created_at: Date
  updated_at: Date
  daily: string | null
  daily_rep: string | null
  osu: string | null
  couple: string | null
}

export interface Guild {
  id: string
  twitchs: Array<string> | null
  name: string
  created_at: Date
  updated_at: Date
  notificationChannel: string | nulll
  roleMessage: string | null
  channelRoleMessage: string | null
  roles:
    | {
        role: string
        emoji: string
      }[]
    | null
}
