import { Client, TextChannel, MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

import { Commits } from '@customTypes/github'

export default async function (bot: Client): Promise<void> {
  const owner = await bot.users.fetch('411557789068951552')

  const [commit]: Array<Commits> = await fetch(
    `https://api.github.com/repos/deepzS2/myBot/commits`
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err)
    })

  const [title, message] = commit.commit.message.split('\n\n')

  const embed = new MessageEmbed()
    .setAuthor(
      owner.username,
      owner.displayAvatarURL(),
      `https://www.discord.com/users/411557789068951552`
    )
    .setTitle('**BOT Update**')
    .setDescription(`**${title}**\n${message}`)
    .setTimestamp()

  try {
    bot.guilds.cache.map((guild) => {
      let found = 0
      guild.channels.cache.map((c) => {
        if (found === 0) {
          if (c.type === 'text') {
            if (c.permissionsFor(bot.user).has('VIEW_CHANNEL') === true) {
              if (c.permissionsFor(bot.user).has('SEND_MESSAGES') === true) {
                ;(c as TextChannel).send(embed)
                found = 1
              }
            }
          }
        }
      })
    })
  } catch (err) {
    console.log('Could not send message to a (few) guild(s)!')
    console.error(err)
  }
}
