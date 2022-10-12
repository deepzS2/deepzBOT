import './helpers/extensions/string'
import './helpers/extensions/date'
import 'reflect-metadata'

import { Player } from 'discord-music-player'
import { Container } from 'inversify'

import createLogger from '@deepz/logger'
import { Client } from '@deepz/structures'
import { Logger } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

async function bootstrap() {
  const container = new Container()

  // Utils
  container.bind<Container>('Container').toConstantValue(container)
  container.bind<Logger>('Logger').toConstantValue(createLogger())
  container
    .bind(Player)
    .toDynamicValue(
      (ctx) =>
        new Player(ctx.container.get(Client), {
          leaveOnEmpty: true,
          quality: 'high',
          deafenOnJoin: true,
          leaveOnStop: true,
          leaveOnEnd: false,
        })
    )
    .inSingletonScope()

  // Client and Database
  container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient())
  container.bind(Client).toSelf().inSingletonScope()

  const client = container.get(Client)
  const database = container.get(PrismaClient)

  await database.$connect()
  await client.start()
}

bootstrap()
