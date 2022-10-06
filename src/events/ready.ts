import { Event } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseEvent } from '@deepz/structures'

@Event('ready')
export default class ReadyEvent extends BaseEvent<'ready'> {
  run() {
    logger.info('Bot is online!')
  }
}
