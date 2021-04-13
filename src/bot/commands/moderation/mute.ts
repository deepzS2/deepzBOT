import { MessageEmbed } from 'discord.js'
import ms from 'ms'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

import functions from '../../functions'

export default class MuteCommand implements Command {
  commandNames = ['mute']
  commandExamples = [
    {
      example: 'd.mute @『 ♥ deepz ♥ 』#4008 ugly...',
      description: 'Muted...',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.report <user> <time> <reason>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}report to report someone from the guild.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const mUser = functions.getMember(originalMessage, args.shift())

    const mTime = Number(args.shift())

    if (!mUser || mUser.user.id === originalMessage.author.id) {
      originalMessage.channel.send(
        `**:x: Please provide a valid user to kick!**`
      )

      return
    }

    if (!mTime || isNaN(mTime)) {
      originalMessage.channel.send(
        `**:x: Please provide a valid time to mute!**`
      )

      return
    }

    const mReason = args.join(' ')

    if (!mReason) {
      originalMessage.channel.send(
        `**:x: Please provide a reason for kicking him!**`
      )

      return
    }

    let mutedrole = originalMessage.guild.roles.cache.find(
      (r) => r.name === 'Muted!'
    )

    if (!mutedrole) {
      try {
        mutedrole = await originalMessage.guild.roles.create({
          data: {
            name: 'Muted!',
            color: '#000000',
            permissions: [],
          },
          reason: 'We needed the mute role!',
        })

        originalMessage.guild.channels.cache.forEach(async (channel) => {
          await channel.createOverwrite(mutedrole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            SPEAK: false,
          })
        })

        await mUser.roles.add(mutedrole.id)

        originalMessage.channel.send(
          `<@${mUser.id}> has been muted for ${ms(ms(mTime))}`
        )

        setTimeout(function () {
          mUser.roles.remove(mUser.id)

          originalMessage.channel.send(`<@${mUser}> has been unmuted!`)
        }, ms(mTime))
      } catch (error) {
        console.error(error)
      }
    }

    const embed = new MessageEmbed()
      .setDescription(`**Mutes**`)
      .setColor('#4360FB')
      .addField(`Muted user`, `${mUser} with ID ${mUser.id}`)
      .addField(
        `Muted by`,
        `<@${originalMessage.author.id}> with ID ${originalMessage.author.id}`
      )
      .addField(`Channel`, originalMessage.channel)
      .addField(`Time`, originalMessage.createdAt)
      .addField(`Reason`, mReason)

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (
      originalMessage.member.hasPermission('MUTE_MEMBERS') &&
      originalMessage.member.hasPermission('MANAGE_MESSAGES')
    ) {
      return true
    } else {
      return false
    }
  }
}
