interface File {
  url: string
}

type Media = {
  tinygif: File
  gif: File
  mp4: File
}

interface Posts {
  media: Array<Media>
}

type Results = Array<Posts>

type Search = {
  /**
   * Search GIFs!
   * @param keyword The keyword to search
   * @param limit The limit of results
   */
  Query: (keyword: string, limit: string) => Promise<Results>
}

export interface Tenor {
  Search: Search
}
