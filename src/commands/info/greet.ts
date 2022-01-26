import { botConfig } from '@root/config'
import { Command } from '@structures/Command'
import CustomMessageEmbed from '@structures/MessageEmbed'

export default new Command({
  name: 'greet',
  aliases: ['greetings', 'gret'],
  description: 'Sends you a hello world!',
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
