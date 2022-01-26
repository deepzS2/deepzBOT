import { GuildDAL } from '@database/index'
import { Event } from '@structures/Event'

export default new Event('guildCreate', async (guild) => {
  await GuildDAL.deleteGuild(guild.id)
})
