import logger from '@deepz/logger'
import { Event } from '@deepz/structures'

export default new Event('guildCreate', async (client, guild) => {
  try {
    const guildExists = await client.database.guild.findFirst({
      where: {
        discordId: guild.id,
      },
    })

    if (!guildExists) return

    await client.database.guild.delete({
      where: {
        discordId: guild.id,
      },
    })
  } catch (error) {
    logger.error(error, 'Error deleting guild from database!')
  }
})
