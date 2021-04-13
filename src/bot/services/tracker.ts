import axios from 'axios'
import { config } from 'dotenv'

config()

const tracker = axios.create({
  baseURL: 'https://public-api.tracker.gg/v2',
  headers: {
    'TRN-Api-Key': process.env.TRACKER_API_KEY,
  },
})

export default tracker
