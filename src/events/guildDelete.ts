import { GuildDAL } from '@database'
import { Event } from '@structures'

export default new Event('guildCreate', async (guild) => {
  await GuildDAL.deleteGuild(guild.id)
})
