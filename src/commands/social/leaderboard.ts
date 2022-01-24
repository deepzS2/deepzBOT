import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { UsersRepository } from '@database'
import { CommandContext } from '@models/command_context'

export default class LeaderboardCommand implements Command {
  commandNames = ['leaderboard', 'guildrank']
  commandExamples = [
    {
      example: 'd.leaderboard',
      description: 'Top 1 :flushed:',
    },
  ]

  commandCategory = 'Social'

  commandUsage = 'd.leaderboard'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}leaderboard to see the guild leaderboard ranks.`
  }

  async run({ originalMessage }: CommandContext): Promise<void> {
    const Users = await UsersRepository()
    const members = originalMessage.guild.members.cache.array()

    const users = await Users.find()

    const filteredMembers = members
      .map((member) => {
        const user = users.find((user) => user.id === member.id)

        if (user) {
          return user
        }
      })
      .filter((el) => {
        return el !== undefined
      })
      .sort((a, b) => {
        return b.xp - a.xp
      })

    let desc = ''

    filteredMembers.forEach((value, index) => {
      if (value && index + 1 <= 10) {
        let level = 1
        let up_xp = 433
        let actual_xp = value.xp

        while (actual_xp >= up_xp) {
          up_xp = level * 433
          actual_xp -= level * 433
          level++
        }

        desc += `${index + 1}. "${
          value.username
        }" with level ${level} and ${value.xp.toLocaleString()}xp!\n`
      }
    })

    const embed = new MessageEmbed()
      .setTitle('Leaderboard')
      .setDescription(
        stripIndents`\`\`\`json
      ${desc}
      \`\`\``
      )
      .setColor('#4360FB')

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
