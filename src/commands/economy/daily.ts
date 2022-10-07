import { MessagePayload } from 'discord.js'
import { inject } from 'inversify'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'
import { PrismaClient } from '@prisma/client'

@Command({
  name: 'daily',
  description: 'Gets your daily money!',
  category: 'ECONOMY',
})
export default class DailyCommand extends BaseCommand {
  @inject(PrismaClient) private readonly _database: PrismaClient

  async run({
    interaction,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    const amount = Math.floor(Math.random() * 1000) + 1

    try {
      const author = await this._database.user.findUniqueOrThrow({
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
        await this._database.user.update({
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
      this._logger.error(error)

      return `***Error trying to get your daily money, try again later...***`
    }
  }
}
