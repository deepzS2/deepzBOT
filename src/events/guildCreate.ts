import { stripIndents } from 'common-tags'
import { ChannelType, PermissionFlagsBits } from 'discord.js'

import { GuildDAL } from '@database/index'
import { client } from '@deepz/index'
import { Event } from '@structures/Event'

export default new Event('guildCreate', async (guild) => {
  const found = false

  guild.channels.cache.forEach((c) => {
    if (
      !found &&
      c.type === ChannelType.GuildText &&
      c.permissionsFor(client.user).has(PermissionFlagsBits.ViewChannel) &&
      c.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)
    ) {
      c.send(stripIndents`
        **Thanks for adding me!! My name is deepz**
        It's a honor being invited to your server! I hope we all can be friends forever :smiley:.
        For help with commands try \`d.help\` or \`d.help <command>\`.
      `)
    }
  })

  await GuildDAL.createGuild({
    id: guild.id,
    name: guild.name,
  })
})
