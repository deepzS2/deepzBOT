import { createWriteStream } from 'fs'
import path from 'path'
import pino from 'pino'

const logFileDestination = path.join(
  __dirname,
  '..',
  'logs',
  `${new Date().format('MM-DD-YYYY')}.log`
)

export default pino(
  {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'dd-mm-yyyy, h:MM:ss TT',
        ignore: 'pid,hostname',
      },
    },
  },
  pino.multistream([
    {
      stream: createWriteStream(logFileDestination, { flags: 'w' }),
    },
  ])
)
