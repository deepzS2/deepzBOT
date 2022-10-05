import { botConfig } from '@deepz/config'
import { Command, CustomMessageEmbed } from '@deepz/structures'

export default new Command({
  name: 'greet',
  aliases: ['greetings', 'gret'],
  description: 'Sends you a hello world!',
  category: 'INFO',

  examples: ['d.greet'],
  run: async ({ client }) => {
    const owner = await client.users.fetch(botConfig.ownerId)

    return new CustomMessageEmbed('**Hello World!**', {
      author: {
        name: `Owner: ${owner.tag}`,
        iconURL: owner.displayAvatarURL(),
      },
      thumbnail: client.user.displayAvatarURL(),
    })
  },
})
