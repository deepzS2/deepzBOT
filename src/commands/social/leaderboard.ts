import { stripIndents } from 'common-tags'

import { getExperienceInformation } from '@helpers'
import { Command, CustomMessageEmbed } from '@structures'

export default new Command({
  name: 'leaderboard',
  aliases: ['guildrank'],
  description: 'Returns the top 10 guild members',
  category: 'SOCIAL',
  slash: 'both',
  examples: ['d.leaderboard'],
  run: async ({ message, client, interaction }) => {
    const users = await client.database.user.findMany()
    const members = users
      .filter((user) => {
        // Filters by guild members
        return (interaction ?? message).guild.members.cache.find(
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
  },
})
