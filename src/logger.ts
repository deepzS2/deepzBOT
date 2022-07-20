import pino from 'pino'

import { isDev } from './config'

export default pino({
  enabled: isDev,
})
