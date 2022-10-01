import logger from '@deepz/logger'
import { Event } from '@deepz/structures'

export default new Event('ready', async () => {
  logger.info('Bot is online!')
})
