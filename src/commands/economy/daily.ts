import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import logger from '@deepz/logger'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

@Command({
  name: 'daily',
  description: 'Gets your daily money!',
  category: 'ECONOMY',
})
export default class DailyCommand extends BaseCommand {
  async run({
    client,
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const amount = Math.floor(Math.random() * 1000) + 1

    try {
      const author = await client.database.user.findUniqueOrThrow({
        where: {
          discordId: interaction.user.id,
        },
      })

      const now = Date.dayjs()
      const nextDaily = author.dailyMoney?.toDayJs()

      if (nextDaily && now.isBefore(nextDaily)) {
        const timeRemaining = Date.duration(nextDaily.diff(now))
        return `**:yen: | You already take your daily... Come back in ${timeRemaining.hours()}h ${timeRemaining.minutes()}m ${timeRemaining.seconds()}s**`
      } else {
        await client.database.user.update({
          where: {
            id: author.id,
          },
          data: {
            balance: {
              increment: amount,
            },
            dailyMoney: Date.dayjs().add(1, 'days').toDate(),
          },
        })

        return `**${author.username}, here's your daily money: :yen: ${amount} credits!**`
      }
    } catch (error) {
      logger.error(error)

      return `***Error trying to get your daily money, try again later...***`
    }
  }
}
