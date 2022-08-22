import axios from 'axios'

import { trackerApiKey } from '@deepz/config'

const tracker = axios.create({
  baseURL: 'https://public-api.tracker.gg/v2',
  headers: {
    'TRN-Api-Key': trackerApiKey,
  },
})

export default tracker
