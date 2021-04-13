import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class EvalCommand implements Command {
  commandNames = ['about', 'bout']
  commandExamples = [
    {
      example: 'd.about',
      description: 'Wants to learn more about me? :blush:',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.about'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}about to get informations about the bot.`
  }

  async run({ bot, originalMessage }: CommandContext): Promise<void> {
    const owner = await bot.users.fetch('411557789068951552')

    const desc = stripIndents`
    Hello! I'm deepz bot and thank you for your support, I'm a bot developed by ${owner.username}#${owner.discriminator}.
    I was developed by him using [TypeScript](https://www.typescriptlang.org/) and the most famous [Node.JS](https://nodejs.org/en/)!
    Actually I'm hosted by [Heroku](https://www.heroku.com/), if in case I'm offline is because my host is sleeping (This happens because I'm hosted for free, if you want to help me to keep it always up please contact the owner!)! Oh and I have a [website](https://deepzin.herokuapp.com/) now!
    Thank you and have fun with me :smile:!
    `

    const embed = new MessageEmbed()
      .setTitle(`About`)
      .setColor('#4360FB')
      .setDescription(desc)
      .setThumbnail(bot.user.displayAvatarURL())

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
