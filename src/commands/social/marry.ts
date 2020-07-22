import { Message } from 'discord.js'
import functions from 'src/functions'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'

export default class MarryCommand implements Command {
  commandNames = ['marry', 'marriage']
  commandExamples = [
    {
      example: 'd.marry @『 ♥ deepz ♥ 』#4008',
      description: 'They grow up so fast :sneezing_face:... Happy marriage!',
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.marry <username>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}marry to marry with someone.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel.send(`**:x: You're trying to marry nobody?**`)
      return
    }

    const userToMarry = functions.getMember(originalMessage, args[0])
    const author = originalMessage.author

    const msg = await originalMessage.channel.send(
      `**:ring: ${userToMarry} you accept marrying with ${author.username}?**`
    )

    msg.channel
      .awaitMessages(
        (msgCollected: Message) =>
          msgCollected.author.id === userToMarry.id &&
          (msgCollected.content.toLowerCase() === 'yes' ||
            msgCollected.content.toLowerCase() === 'no'),
        {
          time: 30000,
          max: 1,
          errors: ['time'],
        }
      )
      .then(async (collected) => {
        try {
          if (collected.first().content === 'no') {
            originalMessage.channel.send(
              `**Yeah :frowning2:... ${
                collected.first().author
              } just refused to marry with ${author.username}...**`
            )
            return
          }

          const { couple } = await connection('users')
            .where('id', '=', author.id)
            .first()
            .select('couple')

          if (couple) {
            originalMessage.channel.send(
              `**:x: You're already married with someone... You're trying a divorce? Or betraying?**`
            )
            return
          }

          await connection('users').where('id', '=', author.id).update({
            couple: userToMarry.id,
          })

          originalMessage.channel.send(
            `**:ring: ${author.username} and ${userToMarry} just married! Congratulations! :smiling_face_with_3_hearts:**`
          )
        } catch (error) {
          console.error(error)
          originalMessage.channel.send(
            `**:x: Something went wrong, please try again later!**`
          )
        }
      })
      .catch(async () => {
        await msg.channel.send(
          `**Your couple didn't answer to your marriage request...**`
        )
      })
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
