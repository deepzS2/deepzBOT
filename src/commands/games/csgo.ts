import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'
import tracker from '@services/tracker'

export default class FortniteCommand implements Command {
  commandNames = ['csgo', 'counterstrike', 'globaloffensive']
  commandExamples = [
    {
      example: 'd.csgo deepzqueen',
      description: 'The best profile! :sunglasses:',
    },
  ]

  commandCategory = 'Games'

  commandUsage = 'd.csgo <Steam URL, Steam vanity username or Steam ID>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}csgo to get informations from Counter-Strike: Global Offensive server about the user.`
  }

  async run({ args, originalMessage }: CommandContext): Promise<void> {
    try {
      if (!args[0]) {
        originalMessage.channel.send(
          `**:x: Plese provide me a Steam ID, Steam community URL, or a Steam vanity username.**`
        )
      }

      const res = await tracker.get(
        `/csgo/standard/search?query=${args[0]}&platform=steam`
      )

      const {
        data: { data },
      } = await tracker.get(
        `/csgo/standard/profile/steam/${res.data.data[0].platformUserId}`
      )

      const embed = new MessageEmbed()
        .setTitle(data.platformInfo.platformUserHandle)
        .setAuthor(
          'Counter-Strike: Global Offensive',
          'https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png'
        )
        .setThumbnail(data.platformInfo.avatarUrl)
        .setDescription(
          stripIndents`
        -> **Kills:** ${data.segments[0].stats.kills.displayValue}
        -> **Deaths:** ${data.segments[0].stats.deaths.displayValue}
        -> **%Headshot:** ${data.segments[0].stats.headshotPct.displayValue}
        -> **K/D:** ${data.segments[0].stats.kd.displayValue}
        -> **Accuracy:** ${data.segments[0].stats.shotsAccuracy.displayValue}
        -> **Score:** ${data.segments[0].stats.score.displayValue}
        -> **Time played:** ${data.segments[0].stats.timePlayed.displayValue}
        -> **Wins:** ${data.segments[0].stats.wins.displayValue}
        -> **Losses:** ${data.segments[0].stats.losses.displayValue}
        -> **%Win:** ${data.segments[0].stats.wlPercentage.displayValue}
        `
        )
        .setColor('#4360FB')
        .setFooter(`Next update: ${new Date(data.expiryDate).toLocaleString()}`)

      originalMessage.channel.send(embed)
    } catch (error) {
      console.error(error.response.data)

      if (error.response && error.response.status === 500) {
        originalMessage.channel.send(
          `**:x: Something went wrong with the tracker server API! Please try again later**`
        )
        return
      }

      if (error.response && error.response.status === 404) {
        originalMessage.channel.send(`**:x: Player not found**`)
        return
      }

      if (
        error.response &&
        error.response.data.errors[0].code === 'CollectorResultStatus::Private'
      ) {
        originalMessage.channel.send(`**:x: Private profile :flushed:...**`)
        return
      }

      originalMessage.channel.send(
        `**:x: Something went wrong! Please try again later**`
      )
    }
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
