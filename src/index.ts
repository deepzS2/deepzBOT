import './helpers/string'
import './helpers/date'

import { ExtendedClient } from '@structures'

export const client: ExtendedClient = new ExtendedClient()

client.start()
