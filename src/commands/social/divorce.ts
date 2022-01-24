import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class MarryCommand implements Command {
  commandNames = ['divorce']
  commandExamples = [
    {
      example: 'd.divorce @『 ♥ deepz ♥ 』#4008',
      description: "That's sad...",
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.divorce <username>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}divorce to divorce with someone.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const Users = await UsersRepository()

    if (!args[0]) {
      originalMessage.channel.send(`**:x: You're trying to divorce nobody?**`)
      return
    }

    const userToDivorce = functions.getMember(originalMessage, args[0])

    const author = await Users.findOneOrFail({
      where: { id: originalMessage.author.id },
    })

    if (userToDivorce.id === originalMessage.author.id) {
      originalMessage.channel.send(`**:x: You're trying to divorce yourself?**`)
      return
    }

    try {
      if (!author.couple) {
        originalMessage.channel.send(`**:x: You're trying to divorce nobody?**`)
        return
      } else if (userToDivorce.id !== author.couple) {
        originalMessage.channel.send(
          `**:x: You're not married with that person...**`
        )
        return
      }

      author.couple = null

      await Users.save(author)

      originalMessage.channel.send(
        `**:frowning2: ${author.username} and ${userToDivorce} just divorced...**`
      )
    } catch (error) {
      originalMessage.channel.send(
        `**:x: Something went wrong, please try again later!**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
