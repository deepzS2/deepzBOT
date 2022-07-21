import { stripIndents } from 'common-tags'

import { Event } from '@structures'

export default new Event('guildCreate', async (client, guild) => {
  const found = false

  guild.channels.cache.forEach((c) => {
    if (
      !found &&
      c.type === 'GUILD_TEXT' &&
      c.permissionsFor(client.user).has('VIEW_CHANNEL') &&
      c.permissionsFor(client.user).has('SEND_MESSAGES')
    ) {
      c.send(stripIndents`
        **Thanks for adding me!! My name is deepz**
        It's a honor being invited to your server! I hope we all can be friends forever :smiley:.
        For help with commands try \`/help\` or \`/help <command>\`.
      `)
    }
  })

  await client.database.guild.create({
    data: {
      discordId: guild.id,
      name: guild.name,
    },
  })
})
