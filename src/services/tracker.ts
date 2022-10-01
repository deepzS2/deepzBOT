import { trackerApiKey } from '@deepz/config'
import { createRequest } from '@deepz/helpers'

const tracker = createRequest({
  baseURL: 'https://public-api.tracker.gg/v2',
  headers: {
    'TRN-Api-Key': trackerApiKey,
  },
})

export default tracker
