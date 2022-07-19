import { stripIndents } from 'common-tags'

import { botConfig } from '@deepz/config'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'about',
  aliases: ['bout'],
  description: 'Displays the information about the bot!',
  category: 'CORE',
  slash: 'both',
  run: async ({ client }) => {
    const owner = await client.users.fetch(botConfig.ownerId)

    const description = stripIndents`
      "Boa noite!" I'm deepz BOT and thank you for your support, I'm a BOT developed and maintained by ${owner.username}#${owner.discriminator}.
      I was developed using [TypeScript](https://www.typescriptlang.org/) and the most famous [Node.JS](https://nodejs.org/en/), and soon I'll be maintained using DevOps knowledge.
      My owner works on projects like this since 2019, if you ever want to talk to him, feel free to send a message in Discord.
      Thank you and have fun :smiley:!
    `

    return new CustomMessageEmbed('About me', {
      color: '#4360FB',
      description,
      thumbnail: client.user.displayAvatarURL(),
    })
  },
})
