import { botConfig } from '@deepz/config'
import logger from '@deepz/logger'
import { Event } from '@deepz/structures'

// Now messages have blank content?
export default new Event('messageCreate', async (client, message) => {
  const { prefix } = botConfig

  // Not a BOT
  if (message.author.bot) return

  try {
    // No DMs
    if (!message.content.startsWith(prefix) || message.channel.isDMBased())
      return

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
    logger.error(error, 'Error upserting the user in database!')
  }
})
