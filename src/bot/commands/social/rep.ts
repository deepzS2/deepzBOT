import ms from 'parse-ms'

import { Command } from '@customTypes/commands'
import { Users } from '@database'
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

    const { reputation } = await Users()
      .where('id', '=', target.user.id)
      .first()
      .select('reputation')

    const { daily_rep } = await Users()
      .where('id', '=', originalMessage.author.id)
      .first()
      .select('daily_rep')

    if (
      daily_rep !== null &&
      timeout - (Date.now() - new Date(daily_rep).getTime()) > 0
    ) {
      const time = ms(timeout - (Date.now() - new Date(daily_rep).getTime()))

      originalMessage.channel.send(
        `**📝  | You already used your daily rep... Come back in ${time.hours}h ${time.minutes}m ${time.seconds}s**`
      )
    } else {
      originalMessage.channel.send(
        `**${originalMessage.author.username} just give to ${target} an reputation point!**`
      )

      await Users()
        .where('id', '=', target.user.id)
        .first()
        .update({
          reputation: reputation + 1,
        })

      await Users().where('id', '=', originalMessage.author.id).first().update({
        daily_rep: new Date().toISOString(),
      })
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
