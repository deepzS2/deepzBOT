import { initializeDatabase } from '@database'
import logger from '@deepz/logger'
import { Event } from '@structures'

export default new Event('ready', async () => {
  await initializeDatabase()
  logger.info('Bot is online!')
})
