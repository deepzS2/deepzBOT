import axios from 'axios'
import { config } from 'dotenv'

config()

const tracker = axios.create({
  baseURL: 'https://api.fortnitetracker.com/v1/profile/',
  headers: {
    'TRN-Api-Key': process.env.TRACKER_API_KEY,
  },
})

export default tracker
