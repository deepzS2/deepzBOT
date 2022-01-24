import { stripIndents } from 'common-tags'
import dateFormat from 'dateformat'
import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class SteamCommand implements Command {
  readonly commandNames = ['steam', 'stm', 'steaminfo']
  readonly commandCategory = 'Info'
  readonly commandExamples = [
    {
      example: 'd.steam deepzqueen',
      description: "View deepz's steam information",
    },
  ]

  readonly commandUsage = 'd.steam [steam url id]'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}steam to return steams profile information from someone.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    if (!args[0]) {
      originalMessage.channel.send(`***Please provide an account name!***`)
      return
    }

    const token = process.env.STEAM_TOKEN
    const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${args.join(
      ' '
    )}`

    await originalMessage.channel.startTyping()

    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        if (body.response.success === 42) {
          originalMessage.channel.send(
            'I was unable to find a steam profile with that name'
          )
          return
        }

        const id = body.response.steamid
        const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`
        const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`
        const state = [
          'Offline',
          'Online',
          'Busy',
          'Away',
          'Snooze',
          'Looking to trade',
          'Looking to play',
        ]

        fetch(summaries)
          .then((res) => res.json())
          .then((body) => {
            if (!body.response) {
              originalMessage.channel.send(
                'I was unable to find a steam profile with that name'
              )
              return
            }

            const {
              personaname,
              avatarfull,
              realname,
              personastate,
              loccountrycode,
              profileurl,
              timecreated,
            } = body.response.players[0]

            fetch(bans)
              .then((res) => res.json())
              .then((body) => {
                if (!body.players)
                  return originalMessage.channel.send(
                    'I was unable to find a steam profile with that name'
                  )

                const { NumberOfVACBans, NumberOfGameBans } = body.players[0]

                const embed = new MessageEmbed()
                  .setColor('#4360fb')
                  .setAuthor(`Steam Services | ${personaname}`, avatarfull)
                  .setThumbnail(avatarfull)
                  .setDescription(
                    stripIndents`**Real Name:** ${realname || 'Unknown'}
                            **Status:** ${state[personastate]}
                            **Country:** :flag_${
                              loccountrycode
                                ? loccountrycode.toLowerCase()
                                : 'white'
                            }:
                            **Account Created:** ${dateFormat(
                              timecreated * 1000,
                              'd/mm/yyyy (h:MM:ss TT)'
                            )}
                            **Bans:** Vac: ${
                              NumberOfVACBans || '0'
                            }, Game: ${NumberOfGameBans}
                            **Link:** [link to profile](${profileurl})`
                  )
                  .setTimestamp()

                originalMessage.channel.send(embed)
                originalMessage.channel.stopTyping()
              })
          })
          .catch((err) => {
            console.error(err)

            originalMessage.channel.send(
              `**:x: Something went wrong! Please try again later!**`
            )

            originalMessage.channel.stopTyping()
          })
      })
      .catch((err) => {
        console.error(err)

        originalMessage.channel.send(
          `**:x: Something went wrong! Please try again later!**`
        )

        originalMessage.channel.stopTyping()
      })
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
