export interface IAnimesFetchResponse {
  data: IAnime[]
}

export interface IAnimeByIdFetchResponse {
  data: IAnime
}

export interface IGenresByAnimeFetchResponse {
  data: IGenre[]
}

export interface IAnime {
  id: string
  type: string
  links: IAnimeLink
  attributes: IAnimeAttributes
  relationships: IAnimeRelationships
}

export interface IGenre {
  id: string
  type: string
  links: IAnimeLink
  attributes: IGenreAttributes
}

export interface IAnimeLink {
  self: string
}

export interface IAnimeTitles {
  en: string
  en_jp: string
  ja_jp: string
}

export interface IAnimeRating {
  2: 4424
  3: 61
  4: 431
  5: 36
  6: 203
  7: 40
  8: 4129
  9: 54
  10: 862
  11: 78
  12: 2524
  13: 164
  14: 8776
  15: 434
  16: 9092
  17: 905
  18: 11109
  19: 831
  20: 36971
}

export interface IAnimeImage {
  tiny: string
  small: string
  large: string
  original: string
  meta: {
    dimensions: {
      tiny: {
        width: string
        height: string
      }
      small: {
        width: string
        height: string
      }
      large: {
        width: string
        height: string
      }
    }
  }
}

export interface IGenreAttributes {
  createdAt: string
  updatedAt: string
  name: string
  slug: string
  description: string
}

export interface IAnimeRelationships {
  genres: {
    links: IAnimeLink & { related: string }
  }
  categories: {
    links: IAnimeLink & { related: string }
  }
  castings: {
    links: IAnimeLink & { related: string }
  }
  installments: {
    links: IAnimeLink & { related: string }
  }
  mappings: {
    links: IAnimeLink & { related: string }
  }
  reviews: {
    links: IAnimeLink & { related: string }
  }
  mediaRelationships: {
    links: IAnimeLink & { related: string }
  }
  characters: {
    links: IAnimeLink & { related: string }
  }
  staff: {
    links: IAnimeLink & { related: string }
  }
  productions: {
    links: IAnimeLink & { related: string }
  }
  quotes: {
    links: IAnimeLink & { related: string }
  }
  episodes: {
    links: IAnimeLink & { related: string }
  }
  streamingLinks: {
    links: IAnimeLink & { related: string }
  }
  animeProductions: {
    links: IAnimeLink & { related: string }
  }
  animeCharacters: {
    links: IAnimeLink & { related: string }
  }
  animeStaff: {
    links: IAnimeLink & { related: string }
  }
}

export interface IAnimeAttributes {
  createdAt: string
  updatedAt: string
  titles: IAnimeTitles
  slug: string
  synopsis: string
  description: string
  coverImageTopOffset: number
  canonicalTitle: string
  abbreviatedTitles: string[]
  averageRating: string
  ratingFrequencies: IAnimeRating
  userCount: number
  favoritesCount: number
  startDate: string
  endDate: string
  nextRelease: unknown
  popularityRank: number
  ratingRank: number
  ageRating: 'G' | 'PG' | 'R' | 'R18'
  ageRatingGuide: string
  showType: 'ONA' | 'OVA' | 'TV' | 'movie' | 'music' | 'special'
  subtype: 'ONA' | 'OVA' | 'TV' | 'movie' | 'music' | 'special'
  status: 'current' | 'finished' | 'tba' | 'unreleased' | 'upcoming'
  tba: string
  posterImage: IAnimeImage
  coverImage: IAnimeImage
  episodeCount: number
  episodeLength: number
  youtubeVideoId: string
  nsfw: boolean
}
