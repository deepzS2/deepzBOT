import { Event } from '../structures/Event'
import { deleteGuild } from '../database/dal/guild'

export default new Event('guildCreate', async (guild) => {
  await deleteGuild(guild.id)
})

