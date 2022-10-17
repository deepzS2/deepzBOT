import { stripIndents } from 'common-tags'
import { MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { getExperienceInformation } from '@deepz/helpers'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

@Command({
  name: 'leaderboard',
  description: 'Returns the top 10 guild members',
  category: 'SOCIAL',
})
export default class LeaderboardCommand extends BaseCommand {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    interaction,
    client,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const users = await this._database.guildMembers.findMany({
      where: {
        guildId: interaction.guildId,
      },
    })

    const members = users
      .sort((a, b) => b.experience - a.experience) // Sort
      .splice(0, 10) // Top 10

    const description = await members.reduce(
      async (prev, curr) => {
        const { level } = getExperienceInformation(curr.experience)
        const user = await client.users.fetch(curr.userId)
        const result = await prev

        result.value += `${result.index + 1}. "${
          user.username
        }" with level ${level} and ${curr.experience.toLocaleString()}xp!\n`
        result.index++

        return result
      },
      Promise.resolve({
        value: '',
        index: 0,
      })
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
