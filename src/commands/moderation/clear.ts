import { TextChannel } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class ClearCommand implements Command {
  commandNames = ['clear', 'e', 'evaluate']
  commandExamples = [
    {
      example: 'd.clear 10',
      description: 'Clears 10 messages',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.clear <number>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}clear to clear the current channel chat.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args.join(' ')) {
      originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, you haven't given an amount of messages which should be deleted!**`
      )
      return
    }

    if (isNaN(parseInt(args.join(' ')))) {
      originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, the amount parameter isn't a number!**`
      )

      return
    }

    if (parseInt(args.join(' ')) > 100) {
      originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, you can't delete more than 100 messages at once!**`
      )

      return
    }

    if (parseInt(args.join(' ')) < 1) {
      originalMessage.channel.send(
        `**:x: ${originalMessage.author.username}, you have to delete at least 1 message!**`
      )

      return
    }

    if (originalMessage.deletable) {
      originalMessage.delete()
    }

    await originalMessage.channel.messages
      .fetch({ limit: parseInt(args.join(' ')) })
      .then((messages) => {
        ;(originalMessage.channel as TextChannel).bulkDelete(messages)
      })
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (!originalMessage.member.hasPermission('MANAGE_MESSAGES')) {
      return false
    } else {
      return true
    }
  }
}
