import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class AddRoleCommand implements Command {
  commandNames = ['addRole']
  commandExamples = [
    {
      example: 'd.addRole @『 ♥ deepz ♥ 』#4008 ugly',
      description: 'Role ugly to ugliest person...',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.addRole <user> <role>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}addRole to give role to someone from the guild.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const targetUser = functions.getMember(originalMessage, args.shift())

    if (!targetUser || targetUser.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**:x: Please provide a valid user to give a role!**`
      )

      return
    }

    const roleName = args.join(' ')
    const { guild } = originalMessage

    const role = guild.roles.cache.find((role) => role.name === roleName)

    if (!role) {
      originalMessage.channel.send(
        `**:x: There is no role with name ${roleName}!**`
      )

      return
    }

    const member = guild.members.cache.get(targetUser.id)
    member.roles.add(role)

    originalMessage.channel.send(
      `**:ballot_box_with_check: Now ${targetUser.nickname} have ${roleName} role**`
    )
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (!originalMessage.member.hasPermission('ADMINISTRATOR')) {
      return false
    } else {
      return true
    }
  }
}
