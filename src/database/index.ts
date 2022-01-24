import 'reflect-metadata'
import path from 'path'
import { ConnectionOptions, createConnection, Repository } from 'typeorm'

import { databaseConfig } from '../config'
import { Guild } from './entities/Guild'
import { User } from './entities/User'

const config: ConnectionOptions = Object.assign(
  { entities: [path.join(__dirname, 'entities', '*.{ts,js}')] },
  databaseConfig
)

export const UsersRepository = async (): Promise<Repository<User>> => {
  const connection = await createConnection(config)
  return connection.getRepository(User)
}

export const GuildsRepository = async (): Promise<Repository<Guild>> => {
  const connection = await createConnection(config)
  return connection.getRepository(Guild)
}

export async function insertUser(id: string, username: string): Promise<void> {
  const Users = await UsersRepository()

  const user = new User()
  user.id = id
  user.username = username

  await Users.insert(user)
}

export async function insertGuild(id: string, name: string): Promise<void> {
  const Guilds = await GuildsRepository()

  const guild = new Guild()
  guild.id = id
  guild.name = name

  await Guilds.insert(guild)
}

export type IGuildsRepository = Repository<Guild>
export type IUsersRepository = Repository<User>
