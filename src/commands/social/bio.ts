import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
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
    const Users = await UsersRepository()
    const user = await Users.findOneOrFail({
      where: { id: originalMessage.author.id },
    })

    if (args.length === 0) {
      originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, please provide a text!**`
      )
      return
    }

    user.bio = args.join(' ')

    await Users.save(user)

    originalMessage.channel.send(
      `**📝  | ${originalMessage.author.username}, bio changed succesfully!**`
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
