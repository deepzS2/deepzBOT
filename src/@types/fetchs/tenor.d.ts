export interface IMediaData {
  preview: string
  url: string
  dims: number[]
  size: number
}

export interface IMedia {
  gif: IMediaData
  mediumgif: IMediaData
  tinygif: IMediaData
  nanogif: IMediaData
  mp4: IMediaData
}

export interface IGif {
  id: string
  media: Array<IMedia>
  hasaudio: boolean
  tags: string[]
  title: string
  itemurl: string
  hascaption: boolean
  url: string
  created: number
}

export interface IGifSearchResponse {
  next: string
  results: IGif[]
}
