import './helpers/string'
import './helpers/date'

import { ExtendedClient } from '@deepz/structures'

async function bootstrap() {
  const client: ExtendedClient = new ExtendedClient()

  await client.database.$connect()
  await client.start()
}

bootstrap()
