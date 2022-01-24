import ms from 'parse-ms'

import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class RepCommand implements Command {
  commandNames = ['rep']
  commandExamples = [
    {
      example: 'd.rep @『 ♥ deepz ♥ 』#4008',
      description: 'Give an respect point to deepz',
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.rep <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}rep to give an reputation point to someone.`
  }

  async run({ args, originalMessage }: CommandContext): Promise<void> {
    const Users = await UsersRepository()
    const timeout = 86400000

    if (args.length === 0) {
      originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, please provide a user to give some reputation points!**`
      )
      return
    }

    const target = functions.getMember(originalMessage, args[0])

    if (target.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**📝  | You can't give reputation to yourself!**`
      )
      return
    }

    const targetUser = await Users.findOneOrFail({
      where: { id: target.user.id },
    })
    const author = await Users.findOneOrFail({
      where: { id: originalMessage.author.id },
    })

    if (
      author.daily_rep !== null &&
      timeout - this.getTimeRemaining(author.daily_rep) > 0
    ) {
      const time = ms(timeout - this.getTimeRemaining(author.daily_rep))

      originalMessage.channel.send(
        `**📝  | You already used your daily rep... Come back in ${time.hours}h ${time.minutes}m ${time.seconds}s**`
      )
    } else {
      originalMessage.channel.send(
        `**${originalMessage.author.username} just give to ${target} an reputation point!**`
      )

      targetUser.reputation += 1
      author.daily_rep = new Date()

      await Users.save(author)
      await Users.save(targetUser)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }

  getTimeRemaining(date: Date): number {
    return Date.now() - new Date(date).getTime()
  }
}
