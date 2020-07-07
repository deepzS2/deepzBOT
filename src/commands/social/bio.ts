import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'

export default class BioCommand implements Command {
  commandNames = ['bio', 'setbio']
  commandExamples = [
    {
      example: 'd.bio This is a cool bio',
      description:
        'Set bio to `This is a cool bio` and it will show on the `d.profile` command',
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.bio'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}bio to change your bio box on the ${commandPrefix}profile command.`
  }

  async run({ args, originalMessage }: CommandContext): Promise<void> {
    if (args.length === 0) {
      originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, please provide a text!**`
      )
      return
    }

    await connection('users')
      .where('id', '=', originalMessage.author.id)
      .update({
        bio: args.join(' '),
      })

    originalMessage.channel.send(
      `**📝  | ${originalMessage.author.username}, bio changed succesfully!**`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
