import { botConfig } from '@deepz/config'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'greet',
  aliases: ['greetings', 'gret'],
  description: 'Sends you a hello world!',
  category: 'INFO',
  slash: false,
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
