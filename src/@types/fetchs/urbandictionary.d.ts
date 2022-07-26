export interface ITermMeaning {
  definition: string
  permalink: string
  thumbs_up: number
  sounds_url: unknown[]
  author: string
  word: string
  defid: number
  current_vote: string
  written_on: string
  example: string
  thumbs_down: number
}

export interface IGetTermMeanings {
  list: ITermMeaning[]
}
