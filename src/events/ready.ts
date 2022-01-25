import { Event } from '../structures/Event'
import { initializeDatabase } from '../database'

export default new Event('ready', async () => {
  await initializeDatabase()
  console.log('Bot is online!')
})
