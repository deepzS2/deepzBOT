import { Command } from '@customTypes/commands'
import connection from '@database'
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
    if (!args[0]) {
      originalMessage.channel.send(`**:x: You're trying to divorce nobody?**`)
      return
    }

    const userToDivorce = functions.getMember(originalMessage, args[0])
    const author = originalMessage.author

    try {
      const { couple } = await connection('users')
        .where('id', '=', author.id)
        .first()
        .select('couple')

      if (!couple) {
        originalMessage.channel.send(`**:x: You're trying to divorce nobody?**`)
        return
      } else if (userToDivorce.id !== couple) {
        originalMessage.channel.send(
          `**:x: You're not married with that person...**`
        )
        return
      }

      await connection('users').where('id', '=', author.id).update({
        couple: null,
      })

      originalMessage.channel.send(
        `**:frowning2: ${author.username} and ${userToDivorce} just divorced...**`
      )
    } catch (error) {
      console.error(error)
      originalMessage.channel.send(
        `**:x: Something went wrong, please try again later!**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
