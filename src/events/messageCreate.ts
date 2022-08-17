import { botConfig } from '@deepz/config'
import logger from '@deepz/logger'
import { Event, CustomMessageEmbed } from '@structures'

// Now messages have blank content?
export default new Event('messageCreate', async (client, message) => {
  const { prefix } = botConfig

  // Not a BOT
  if (message.author.bot) return

  try {
    const { id, username } = message.author

    // Ensure that the user exists in database by when updating if does not exists create the user or just update
    await client.database.user.upsert({
      where: {
        discordId: id,
      },
      create: {
        discordId: id,
        username: username,
      },
      update: {
        experience: {
          increment: Math.floor(Math.random() * 15) + 10,
        },
        balance: {
          increment: Math.floor(Math.random() * 7) + 3,
        },
      },
    })
  } catch (error) {
    logger.error('Error upserting the user in database!', error)
  }

  // No DMs...
  if (!message.content.startsWith(prefix) || message.channel.isDMBased()) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  // Try get by command name or aliases
  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command))

  if (!cmd) return

  try {
    // Show typing :D (I guess)
    await message.channel.sendTyping()

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
  } catch (error) {
    logger.error(error, 'Error with ' + cmd.name + ' command')
  }
})
