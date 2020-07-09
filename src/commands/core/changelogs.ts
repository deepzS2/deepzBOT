import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

import { Command } from '@customTypes/commands'
import { Commits } from '@customTypes/github'
import { CommandContext } from '@models/command_context'

export default class ChangelogCommand implements Command {
  commandNames = ['changelogs', 'changelog', 'log', 'changes']
  commandExamples = [
    {
      example: 'd.changelogs',
      description: 'What I have changed???',
    },
  ]

  commandCategory = 'Core'

  commandUsage = 'd.changelogs'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}changelogs to see the bot changelogs.`
  }

  async run({ bot, originalMessage }: CommandContext): Promise<void> {
    const owner = await bot.users.fetch('411557789068951552')

    const since: Date | string = new Date()
    since.setDate(since.getDate() - 1)

    const gitCommits: Array<Commits> = await fetch(
      `https://api.github.com/repos/deepzS2/myBot/commits?since=${since.toISOString()}`
    )
      .then((res) => res.json())
      .catch((err) => {
        console.error(err)
        return originalMessage.channel.send(
          `**:x: Something went wrong! Possibly with Github API! Try again later...**`
        )
      })

    const commits = gitCommits.map((index) => {
      const {
        commit: {
          committer: { date },
        },
      } = index

      const [title, message] = index.commit.message.split('\n\n')

      return {
        message,
        title,
        date,
      }
    })

    const embed = new MessageEmbed()
      .setAuthor(
        owner.username,
        owner.displayAvatarURL(),
        'https://github.com/deepzS2/myBot'
      )
      .setColor('#4360FB')
      .setDescription(`**Changelogs since yesterday!**`)
      .setTitle('**deepz changelogs**')
      .setThumbnail(bot.user.displayAvatarURL())

    commits.forEach((index) => {
      embed.addField(
        `**${index.title}**`,
        `${
          index.message ? `*Changes: ${index.message}*` : ''
        }\n\nDate: ${new Date(index.date).toLocaleString()}`,
        true
      )
    })

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
