import { MessageAttachment } from 'discord.js'
import request from 'request'

import { Command } from '@customTypes/commands'
import connection from '@database'
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
    const { balance } = await connection('users')
      .where('id', '=', originalMessage.author.id)
      .first()
      .select('balance')

    if (args.length === 0 && !originalMessage.attachments.first()) {
      const { background_image } = await connection('users')
        .where('id', '=', originalMessage.author.id)
        .first()
        .select('background_image')

      const attachment = new MessageAttachment(background_image, 'file.jpg')

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
        request.get(user_attachment.url, async function (err) {
          if (err)
            return originalMessage.channel.send(
              '**Something went wrong while trying to get the image, please try again**'
            )

          const [{ background_image }] = await connection('users')
            .where('id', '=', originalMessage.author.id)
            .first()
            .update(
              {
                background_image: user_attachment.url,
                balance: balance - amount,
              },
              ['background_image']
            )

          const attachment = new MessageAttachment(background_image, 'file.jpg')

          return originalMessage.channel.send(
            `**📝  | ${originalMessage.author.username}, I changed your background by your image!**`,
            attachment
          )
        })

        return
      }
    }

    if (!args[0].match(/.(jpg|jpeg|png|gif)$/i)) {
      originalMessage.channel.send(`**Please send a valid image URL**`)
      return
    }

    request.get(args[0], async function (err) {
      if (err)
        return originalMessage.channel.send(
          '**Something went wrong while trying to get the image, please try again**'
        )

      const [{ background_image }] = await connection('users')
        .where('id', '=', originalMessage.author.id)
        .first()
        .update(
          {
            background_image: args[0],
            balance: balance - amount,
          },
          ['background_image']
        )

      const attachment = new MessageAttachment(background_image, 'file.jpg')

      return originalMessage.channel.send(
        `**📝  | ${originalMessage.author.username}, I changed your background by your image!**`,
        attachment
      )
    })
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
