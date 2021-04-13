import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import tracker from '@services/fortniteTracker'

export default class FortniteCommand implements Command {
  commandNames = ['fortnite', 'fort']
  commandExamples = [
    {
      example: 'd.fornite <your user here>',
      description: 'Hmm... That player is really good!',
    },
    {
      example: 'd.fornite <your user here> touch',
      description:
        'Hmm... That player is really good!!! And he plays on cellphone!',
    },
  ]

  commandCategory = 'Games'

  commandUsage = 'd.fornite <player username> <platform (kbm, touch, gamepad)>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}fornite to get the player stats. You need to provide the platform: kbm (keyboard and mouse), touch (cellphone) and gamepad (console)`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel.send(
        `**:x: Please provide the username of the player!**`
      )
      return
    }

    const platform = args.pop()

    const array = ['kbm', 'gamepad', 'touch']

    let match = false
    array.forEach((value) => {
      if (value === platform) {
        match = true
      }
    })

    if (!match) {
      originalMessage.channel.send(
        `**:x: Please provide the platform! Try \`d.help fortnite\` for more info.**`
      )
      return
    }

    const username = args.join(' ')

    try {
      const { data } = await tracker.get(
        `${platform}/${encodeURIComponent(username)}`
      )

      const stats = data.lifeTimeStats

      const kills = stats.find((s) => s.key === 'Kills')
      const wins = stats.find((s) => s.key === 'Wins')
      const kd = stats.find((s) => s.key === 'K/d')
      const mPlayed = stats.find((s) => s.key === 'Matches Played')
      const wPerc = stats.find((s) => s.key === 'Win%')
      const score = stats.find((s) => s.key === 'Score')

      const embed = new MessageEmbed()
        .setTitle(data.epicUserHandle)
        .setAuthor(
          'Fortnite',
          'https://pm1.narvii.com/7370/91bac9568618da1c93b2f29927d5e006c3a11ee4r1-900-900v2_hq.jpg'
        )
        .setColor('#4360FB')
        .setDescription(
          stripIndents`
      -> **Kills:** ${kills.value}
      -> **Wins:** ${wins.value}
      -> **K/D:** ${kd.value}
      -> **Matches Played:** ${mPlayed.value}
      -> **%Win:** ${wPerc.value}
      -> **Score:** ${score.value}
      `
        )

      originalMessage.channel.send(embed)
    } catch (error) {
      console.error(error)

      originalMessage.channel.send(
        `**Couldn't find that username in the database**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
