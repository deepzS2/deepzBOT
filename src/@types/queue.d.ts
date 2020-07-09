import {
  TextChannel,
  VoiceChannel,
  VoiceConnection,
  DMChannel,
  NewsChannel,
  StreamDispatcher,
} from 'discord.js'

export type Song = {
  title: string
  url: string
  duration: string
  thumbnail: string
  rawDuration: Record<string, number>
}

export interface Queue {
  textChannel: TextChannel | DMChannel | NewsChannel
  voiceChannel: VoiceChannel
  connection: null | VoiceConnection
  songs: Array<Song>
  volume: number
  playing: boolean
  nowPlaying: Song | null
  dispatcher: StreamDispatcher | null
}
