import { initializeDatabase } from '@database/index'
import { Event } from '@structures/Event'

export default new Event('ready', async () => {
  await initializeDatabase()
  console.log('Bot is online!')
})
