import { MessageAttachment } from 'discord.js'
import isImageUrl from 'is-image-url'

import { Command } from '@customTypes/commands'
import { Users } from '@database'
import { CommandContext } from '@models/command_context'

export default class BackgroundCommand implements Command {
  commandNames = ['background', 'bg']
  commandExamples = [
    {
      example:
        'd.background https://66.media.tumblr.com/643b2d596544def2175f3c32ba9927e8/tumblr_p9gk83oMGJ1utijxoo1_1280.jpg',
      description:
        'Set the background to this Image\nNotes: If you use the URL, check if the end of the URL ends with .png, .jpg, .jpeg, etc.',
    },
    {
      example: 'd.background <Attachment here>',
      description:
        'Set the background to the attachment. \nNotes: You send the image and execute the command on the (optional) box.',
    },
  ]

  commandCategory = 'Economy'

  commandUsage = 'd.background <Image URL || Image Attachment>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}greet to change your ${commandPrefix}profile background.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const amount = 600
    const { balance } = await Users()
      .where('id', '=', originalMessage.author.id)
      .first()
      .select('balance')

    if (args.length === 0 && !originalMessage.attachments.first()) {
      const { background_image } = await Users()
        .where('id', '=', originalMessage.author.id)
        .first()
        .select('background_image')

      const attachment = new MessageAttachment(background_image.toString())

      originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, here's your current profile background:**`,
        attachment
      )
      return
    }

    if (balance < amount) {
      originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, you don't have enough credits to change background!**`
      )
      return
    }

    if (args.length === 0) {
      const user_attachment = originalMessage.attachments.first()

      if (user_attachment) {
        if (!isImageUrl(user_attachment.url)) {
          originalMessage.channel.send(
            `**:x: Your image is invalid or corrupted!**`
          )
          return
        }

        const [{ background_image }] = await Users()
          .where('id', '=', originalMessage.author.id)
          .first()
          .update(
            {
              background_image: user_attachment.url,
              balance: balance - amount,
            },
            ['background_image']
          )

        const attachment = new MessageAttachment(background_image.toString())

        originalMessage.channel.send(
          `**📝  | ${originalMessage.author.username}, I changed your background by your image!**`,
          attachment
        )

        return
      }
    }

    if (!isImageUrl(args[0])) {
      originalMessage.channel.send(`**Please send a valid image URL**`)
      return
    }

    const [{ background_image }] = await Users()
      .where('id', '=', originalMessage.author.id)
      .first()
      .update(
        {
          background_image: args[0],
          balance: balance - amount,
        },
        ['background_image']
      )

    const attachment = new MessageAttachment(background_image.toString())

    originalMessage.channel.send(
      `**📝  | ${originalMessage.author.username}, I changed your background by your image!**`,
      attachment
    )
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
