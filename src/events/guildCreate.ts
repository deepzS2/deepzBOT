import { stripIndents } from 'common-tags'

import { Event } from '../structures/Event'
import { createGuild } from '../database/dal/guild'
import { client } from '..'

export default new Event('guildCreate', async (guild) => {
  let found = false

  guild.channels.cache.map((c) => {
    if (!found && c.type === "GUILD_TEXT" && c.permissionsFor(client.user).has('VIEW_CHANNEL') && c.permissionsFor(client.user).has('SEND_MESSAGES')) {
      c.send(stripIndents`
        **Thanks for adding me!! My name is deepz**
        It's a honor being invited to your server! I hope we all can be friends forever :smiley:.
        For help with commands try \`d.help\` or \`d.help <command>\`.
      `)
    }
  })

  await createGuild({
    id: guild.id,
    name: guild.name
  })
})

