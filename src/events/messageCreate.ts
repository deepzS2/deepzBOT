import { ChannelType } from 'discord.js'

import { UserDAL } from '@database/index'
import { CommandType } from '@myTypes'
import { botConfig } from '@root/config'
import { client } from '@root/index'
import logger from '@root/logger'
import { Event } from '@structures/Event'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Event('messageCreate', async (message) => {
  const { prefix } = botConfig

  // Not the own bot xd
  if (message.author.bot) return

  try {
    const { id: userId, username: userTag } = message.author

    const user = await checkIfUserExists(userId, userTag)

    if (user) {
      await UserDAL.updateUser(user.id, {
        xp: user.xp + Math.floor(Math.random() * 15) + 10,
        balance: user.balance + Math.floor(Math.random() * 7) + 3,
      })
    }
  } catch (error) {
    logger.error(error)
  } finally {
    // Command starts with prefix
    if (message.content.startsWith(prefix)) {
      // No DMs here...
      if (message.channel.type === ChannelType.DM) return

      const args = message.content.slice(prefix.length).trim().split(/ +/g)
      const command = args.shift().toLowerCase()

      // Try get by command name or aliases
      const cmd: CommandType =
        client.commands.get(command) ||
        client.commands.get(client.aliases.get(command))

      if (!cmd) return

      // Show typing :D (I guess)
      message.channel.sendTyping()

      // The response is a string or nothing always so it's easy to handle with slash and message
      const responseMessage = await cmd.run({
        args,
        client,
        message,
      })

      if (!responseMessage) return

      // Embed message
      if (responseMessage instanceof CustomMessageEmbed)
        return message.channel.send({
          embeds: [responseMessage],
        })

      // Simple string message
      if (typeof responseMessage === 'string') {
        return message.channel.send(responseMessage)
      }
    }
  }
})

async function checkIfUserExists(id: string, username: string) {
  try {
    let user = await UserDAL.getUserByID(id)

    if (user.username !== username) {
      user = await UserDAL.updateUser(user.id, { username })
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
