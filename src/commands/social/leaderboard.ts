import { stripIndents } from 'common-tags'
import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { getExperienceInformation } from '@deepz/helpers'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'leaderboard',
  description: 'Returns the top 10 guild members',
  category: 'SOCIAL',
})
export default class LeaderboardCommand extends BaseCommand {
  async run({
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const users = await client.database.user.findMany()
    const members = users
      .filter((user) => {
        // Filters by guild members
        return interaction.guild.members.cache.find(
          (member) => user.discordId === member.id
        )
      })
      .sort((a, b) => b.experience - a.experience) // Sort
      .splice(0, 10) // Top 10

    const description = members.reduce(
      (prev, curr) => {
        const { level } = getExperienceInformation(curr.experience)

        prev.value += `${prev.index + 1}. "${
          curr.username
        }" with level ${level} and ${curr.experience.toLocaleString()}xp!\n`
        prev.index++

        return prev
      },
      {
        value: '',
        index: 0,
      }
    )

    return new CustomMessageEmbed('Leaderboard', {
      description: stripIndents`
        \`\`\`json
        ${description.value}
        \`\`\`
      `,
      color: '#4360FB',
    })
  }
}
