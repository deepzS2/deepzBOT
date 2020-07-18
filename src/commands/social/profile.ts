import { createCanvas } from 'canvas'
import { MessageAttachment, Message } from 'discord.js'
import Jimp from 'jimp'
import path from 'path'

import { Command } from '@customTypes/commands'
import connection from '@database'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class ProfileCommand implements Command {
  commandNames = ['profile', 'prof', 'pf', 'p']
  commandExamples = [
    {
      example: 'd.profile',
      description: 'Return your profile information',
    },
    {
      example: 'd.profile @『 ♥ deepz ♥ 』#4008',
      description: "Return deepz's profile information",
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.profile [user]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}profile to get your profile information.`
  }

  async run({ args, originalMessage }: CommandContext): Promise<void> {
    let background, avatar
    if (!args[0]) {
      const { background_image } = await connection('users')
        .where('id', '=', originalMessage.author.id)
        .first()
        .select('background_image')

      background = background_image.toString()

      avatar = await (
        await Jimp.read(
          originalMessage.author.displayAvatarURL({
            format: 'png',
          })
        )
      )
        .resize(71, 71)
        .quality(100)
    } else {
      const mention = functions.getMember(originalMessage, args[0])

      const { background_image } = await connection('users')
        .where('id', '=', mention.user.id)
        .first()
        .select('background_image')

      background = background_image.toString()

      avatar = await (
        await Jimp.read(
          mention.user.displayAvatarURL({
            format: 'png',
          })
        )
      )
        .resize(71, 71)
        .quality(100)
    }

    if (background) {
      try {
        const bg = await (await Jimp.read(background))
          .resize(300, 300)
          .quality(100)

        await loadProfile(originalMessage, avatar, bg)
        return
      } catch (error) {
        console.error(error)
        await originalMessage.channel.send(
          `**Your background image is invalid, we will use the default now, try to change it later!**`
        )
        await loadProfile(originalMessage, avatar)
      }
    } else {
      await loadProfile(originalMessage, avatar)
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}

async function loadProfile(message: Message, avatar, bg = null) {
  const { bio, reputation, balance, xp } = await connection('users')
    .where('id', '=', message.author.id)
    .first()
    .select('*')

  let level = 1
  let up_xp = 433
  let actual_xp = xp

  while (up_xp <= actual_xp) {
    level++
    up_xp = level * 433
    actual_xp -= level * 433
  }

  const canvas = createCanvas(149, 16)
  const ctx = canvas.getContext('2d')

  ctx.font = '14px Roboto'
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(message.author.username, 0, 8, 149)

  const username = await Jimp.read(canvas.toBuffer())
  const template = await Jimp.read(
    path.join(__dirname, '..', '..', 'assets', 'template.png')
  )
  const roboto24 = await Jimp.loadFont(
    path.join(__dirname, '..', '..', 'assets', 'Roboto24.fnt')
  )
  const roboto18 = await Jimp.loadFont(
    path.join(__dirname, '..', '..', 'assets', 'Roboto18.fnt')
  )
  const roboto11 = await Jimp.loadFont(
    path.join(__dirname, '..', '..', 'assets', 'Roboto11.fnt')
  )
  const roboto11Bold = await Jimp.loadFont(
    path.join(__dirname, '..', '..', 'assets', 'Roboto11Black.fnt')
  )
  const progressBar = new Jimp(171, 15)

  progressBar.scan(0, 0, (actual_xp / up_xp) * 171, 15, function (
    x,
    y,
    offset
  ) {
    this.bitmap.data.writeUInt32BE(0x62d06dff, offset)
  })

  const tplClone = await template.clone()

  let profile

  if (bg) {
    profile = await bg.composite(tplClone, 0, 0)
  } else {
    profile = tplClone
  }

  profile = await profile.composite(avatar, 21, 78)

  profile = await profile.composite(username, 139, 115)

  profile = await profile.print(
    roboto18,
    5,
    151,
    {
      text: `+${reputation}rep`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    104,
    21
  )

  profile = await profile.composite(progressBar, 117, 155)

  profile = await profile.print(
    roboto11Bold,
    118,
    155,
    {
      text: `${actual_xp}/${up_xp}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    170,
    15
  )

  profile = await profile.print(
    roboto11,
    224,
    205,
    {
      text: `$ ${balance}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    64,
    13
  )

  profile = await profile.print(
    roboto11,
    224,
    184,
    {
      text: `${xp}xp`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    64,
    13
  )

  profile = await profile.print(
    roboto11,
    116,
    258,
    {
      text: bio || 'This user has no bio',
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP,
    },
    172,
    26
  )

  profile = await profile.print(
    roboto24,
    113,
    199,
    {
      text: `${level}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    52,
    28
  )

  profile = await profile.quality(100).getBufferAsync(Jimp.MIME_PNG)

  const attachment = new MessageAttachment(profile, 'profile.png')

  return message.channel.send(
    `**📝  | ${message.author.username}, here's your profile:**`,
    attachment
  )
}
