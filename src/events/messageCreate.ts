import { botConfig } from 'config'
import { client } from 'index'

import { UserDAL } from '@database/index'
import { CommandType } from '@myTypes'
import { Event } from '@structures/Event'

export default new Event('messageCreate', async (message) => {
  const { prefix } = botConfig

  // Not the own bot xd
  if (message.author.bot) return

  try {
    const user = await checkIfUserExists(
      message.author.id,
      message.author.username
    )

    if (user) {
      await UserDAL.updateUser(user.id, {
        xp: user.xp + Math.floor(Math.random() * 15) + 10,
        balance: user.balance + Math.floor(Math.random() * 7) + 3,
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    // Command starts with prefix
    if (message.content.startsWith(prefix)) {
      // No DMs here...
      if (message.channel.type === 'DM') return

      const args = message.content.slice(prefix.length).trim().split(/ +/g)
      const command = args.shift().toLowerCase()

      const cmd: CommandType = client.commands.get(command)

      if (!cmd) return

      // Show typing :D (I guess)
      message.channel.sendTyping()

      // The response is a string or nothing always so it's easy to handle with slash and message
      const response = await cmd.run({
        args,
        client,
        message,
      })

      if (response && typeof response === 'string')
        message.channel.send(response)
    }
  }
})

async function checkIfUserExists(id: string, username: string) {
  try {
    let user = await UserDAL.getUserByID(id)

    if (user.username !== username) {
      user = await UserDAL.updateUser(id, { username })
    }

    return user
  } catch (error) {
    if ((error as Error).message === 'User not found with that ID') {
      const user = await UserDAL.createUser({ id, username })
      return user
    } else {
      throw error
    }
  }
}
