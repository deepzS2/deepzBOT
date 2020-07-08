import {
  TextChannel,
  VoiceChannel,
  VoiceConnection,
  DMChannel,
  NewsChannel,
} from 'discord.js'

export type Song = {
  title: string
  url: string
  duration: string
}

export interface Queue {
  textChannel: TextChannel | DMChannel | NewsChannel
  voiceChannel: VoiceChannel
  connection: null | VoiceConnection
  songs: Array<Song>
  volume: number
  playing: boolean
}
