import { initializeDatabase } from '@database/index'
import logger from '@root/logger'
import { Event } from '@structures/Event'

export default new Event('ready', async () => {
  await initializeDatabase()
  logger.info('Bot is online!')
})
