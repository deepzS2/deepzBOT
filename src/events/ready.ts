import { Event } from '@deepz/decorators'
import { BaseEvent } from '@deepz/structures'

@Event('ready')
export default class ReadyEvent extends BaseEvent<'ready'> {
  run() {
    this._logger.info('Bot is online!')
  }
}
