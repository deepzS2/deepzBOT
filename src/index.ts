import './helpers/extensions/string'
import './helpers/extensions/date'

import { ExtendedClient } from '@deepz/structures'

async function bootstrap() {
  const client: ExtendedClient = new ExtendedClient()

  await client.database.$connect()
  await client.start()
}

bootstrap()
