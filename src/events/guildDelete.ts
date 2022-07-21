import { Event } from '@structures'

export default new Event('guildCreate', async (client, guild) => {
  await client.database.guild.delete({
    where: {
      discordId: guild.id,
    },
  })
})
