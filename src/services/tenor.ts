import { tenorKey } from '@deepz/config'
import { createRequest } from '@deepz/helpers'
import { IGifSearchResponse } from '@deepz/types/fetchs/tenor'

const tenorRequest = createRequest({
  baseURL: 'https://g.tenor.com/v1',
  params: {
    key: tenorKey,
    locale: 'pt_BR',
  },
})

class Tenor {
  async search(options: { query: string; type: 'gif' | 'tinygif' | 'mp4' }) {
    return await tenorRequest<IGifSearchResponse>({
      url: '/search',
      query: {
        media_filter: options.type,
        q: options.query,
      },
    })
  }
}

export default new Tenor()
