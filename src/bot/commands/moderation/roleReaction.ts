import { Guild, Message, MessageEmbed, TextChannel } from 'discord.js'

import { Command } from '@customTypes/commands'
import { Guilds } from '@database'
import { CommandContext } from '@models/command_context'

export default class RoleReactionCommand implements Command {
  commandNames = ['reaction', 'rolereaction', 'rolemessage', 'rolemsg', 'role']
  commandExamples = [
    {
      example: 'd.reaction create',
      description: 'Initialize the process to create a role reaction message',
    },
    {
      example: 'd.reaction delete',
      description: 'Delete the role reaction message',
    },
  ]

  commandCategory = 'Moderation'

  commandUsage = 'd.reaction <create | delete>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}clear to clear the current channel chat.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (args[0] === 'create') {
      const { roleMessage } = await Guilds()
        .select(`roleMessage`)
        .where('id', '=', originalMessage.guild.id)
        .first()

      if (roleMessage) {
        originalMessage.channel.send(
          `**:x: This guild already have a message with the reactions roles! If you want to delete it use \`d.reaction delete\`**`
        )
        return
      }

      await createRoleReaction(
        originalMessage.guild,
        originalMessage,
        async (err, roleMessage, roles, channel) => {
          if (err) {
            originalMessage.channel.send(`**:x: ${err.message}**`)
            return
          }

          roles.forEach(async (value) => {
            await roleMessage.react(value.emoji)
          })

          await Guilds().where('id', '=', originalMessage.guild.id).update({
            roleMessage: roleMessage.id,
            channelRoleMessage: channel.id,
            roles,
          })
        }
      )
    } else if (args[0] === 'delete') {
      try {
        const { roles, roleMessage, channelRoleMessage } = await Guilds()
          .where('id', '=', originalMessage.guild.id)
          .first()

        if (!roles || !roleMessage) {
          originalMessage.channel.send(
            `**:x: The server don't have a role reaction message**`
          )
        }

        const channel = originalMessage.guild.channels.cache.find(
          (channel) => channel.id === channelRoleMessage
        )

        const msg = await (channel as TextChannel).messages.resolve(roleMessage)

        if (msg) {
          await msg.delete()
        }

        await Guilds().where('id', '=', originalMessage.guild.id).update({
          roles: null,
          roleMessage: null,
        })

        originalMessage.channel.send(
          `**Reaction role message deleted successfully**`
        )
      } catch (error) {
        console.error(error)
        originalMessage.channel.send(
          `**:x: Something went wrong! Please try again later!**`
        )
      }
    } else {
      originalMessage.channel.send(
        `**:x: Please provide at least one argument of the list: \`create, remove\`**`
      )
    }
  }

  hasPermissionToRun({ originalMessage }: CommandContext): boolean {
    if (!originalMessage.member.hasPermission('ADMINISTRATOR')) {
      return false
    } else {
      return true
    }
  }
}

async function createRoleReaction(
  guild: Guild,
  originalMessage: Message,
  callback: (
    err: Error,
    roleMessage?: Message,
    rolesObj?: {
      role: string
      emoji: string
    }[],
    channel?: TextChannel
  ) => Promise<void>
) {
  const start = await originalMessage.channel.send(
    `So you want to start a role reactions? Okay... Provide me the channel (example: #welcome)`
  )

  const filter = (m: Message) => m.author.id === originalMessage.author.id

  try {
    const response = await start.channel.awaitMessages(filter, {
      max: 1,
      time: 60000,
      errors: ['time'],
    })

    const channelMention = response.first().mentions.channels.first()

    if (!channelMention) {
      await response.first().react('🚫')
      throw new Error('You provided a invalid channel!')
    }

    await response.first().react('✅')

    await originalMessage.channel.send(
      `Yeah... Got it! ${channelMention}! So now tell me which title and/or description you want. Use && to separate between title and description like:\n\`Cool title over here 😎 && Cool description over here too 😳\``
    )

    const getTitleAndDesc = await start.channel.awaitMessages(filter, {
      max: 1,
      time: 60000,
      errors: ['time'],
    })

    const arrayTitleAndDesc = getTitleAndDesc.first().content.split('&&')

    if (!arrayTitleAndDesc[0]) {
      await getTitleAndDesc.first().react('🚫')
      throw new Error("You didn't provided at least a title...")
    }

    await getTitleAndDesc.first().react('✅')

    const title = arrayTitleAndDesc[0]
    const desc = arrayTitleAndDesc[1] ? arrayTitleAndDesc[1] : ''

    await originalMessage.channel.send(
      `Uhum... Yeah... Cool! Got that... You want some specific color? If yes, provide with hexadecimal or just type skip...`
    )

    const getColor = await start.channel.awaitMessages(filter, {
      max: 1,
      time: 60000,
      errors: ['time'],
    })

    const color = getColor.first().content
    const regex = /^[0-9a-fA-F]+$/

    if (color !== 'skip' && !regex.test(color)) {
      getColor.first().react('❌')
      throw new Error('Invalid hexdecimal value...')
    }

    await getColor.first().react('✅')

    await originalMessage.channel.send(
      `Nice color... Now the reactions and roles! Just type like that: \`:some_cool_emoji: Cool role\` and when you're done type \`done\``
    )

    const collector = start.channel.createMessageCollector(filter)

    collector.on('collect', async (m: Message) => {
      await m.react('✅')
      if (m.content === 'done') {
        collector.stop('done')
      }
    })

    collector.on('end', async (collected) => {
      try {
        const messages = collected.array()
        messages.pop()

        const rolesObj: Array<{
          role: string
          emoji: string
        }> = []

        for (let i = 0; i < messages.length; i++) {
          const content = messages[i].content.split(' ')

          const emoji = content.shift()

          const roleName = content.join(' ')
          const role = originalMessage.guild.roles.cache.find((roleValue) =>
            roleValue.name.toLowerCase().includes(roleName.toLowerCase())
          )

          if (!role) {
            throw new Error('404')
          } else {
            rolesObj.push({
              role: role.id,
              emoji: emoji,
            })
          }
        }

        if (isAnyDuplicateEmoji(rolesObj)) {
          throw new Error('Duplicated emojis!')
        }

        await originalMessage.channel.send(
          `Everything okay! Now let's go invite some members!`
        )

        const embed = new MessageEmbed().setTitle(title).setDescription(desc)

        if (color) {
          embed.setColor(`#${color}`)
        }

        const roleMessage = await channelMention.send(embed)

        callback(null, roleMessage, rolesObj, channelMention)
      } catch (error) {
        console.error(error)
        callback(error)
      }
    })
  } catch (error) {
    console.error(error)
    callback(error)
  }
}

function isAnyDuplicateEmoji(
  array: Array<{
    emoji: string
    role: string
  }>
): boolean {
  const counts = {}

  for (let i = 0; i <= array.length; i++) {
    if (counts[array[i].emoji] === undefined) {
      counts[array[i].emoji] = 1
    } else {
      return true
    }
  }

  return false
}
