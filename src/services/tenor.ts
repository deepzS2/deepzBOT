import { tenorKey } from '@deepz/config'
import { IGifSearchResponse } from '@deepz/types/fetchs/tenor'
import { request } from '@helpers'

class Tenor {
  private readonly locale: string

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {
    this.locale = 'pt_BR'
  }

  async search(options: { query: string; type: 'gif' | 'tinygif' | 'mp4' }) {
    return await request<IGifSearchResponse>(
      `${this.baseUrl}/search?key=${this.apiKey}&locale=${this.locale}&media_filter=${options.type}&q=${options.query}`
    )
  }
}

export default new Tenor(tenorKey, 'https://g.tenor.com/v1')
