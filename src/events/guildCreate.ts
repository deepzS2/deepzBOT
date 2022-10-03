import { stripIndents } from 'common-tags'

import logger from '@deepz/logger'
import { Event } from '@deepz/structures'

export default new Event('guildCreate', async (client, guild) => {
  const channel = guild.channels.cache.find(
    (c) =>
      c.permissionsFor(client.user).has('ViewChannel') &&
      c.permissionsFor(client.user).has('SendMessages') &&
      c.isTextBased()
  )

  if (channel.isTextBased())
    channel?.send(stripIndents`
      **Thanks for adding me!! My name is deepz**
      It's a honor being invited to your server!
      For help with commands try \`/help\` or \`/help <command>\`.
    `)

  try {
    await client.database.guild.create({
      data: {
        discordId: guild.id,
        name: guild.name,
      },
    })
  } catch (error) {
    logger.error(error, 'Error inserting guild into database')
  }
})
