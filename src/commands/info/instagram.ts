import { stripIndents } from 'common-tags'
import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

import { Command } from '@customTypes/commands'
import { CommandContext } from '@models/command_context'

export default class InstagramCommand implements Command {
  commandNames = ['instagram', 'insta']
  commandExamples = [
    {
      example: 'd.instagram <someone>',
      description: 'Stalker :shushing_face:',
    },
  ]

  commandCategory = 'Info'

  commandUsage = 'd.instagram <user>'

  getHelpMessage(commandPrefix: string): string {
    return `Use ${commandPrefix}instagram to get the user instagram information.`
  }

  async run({ originalMessage, args }: CommandContext): Promise<void> {
    const name = args.join(' ')

    if (!name) {
      originalMessage.channel
        .send(`**${originalMessage.author.username}, please provide an user**`)
        .then((m) => m.delete({ timeout: 5000 }))

      return
    }

    const url = `https://instagram.com/${name}/?__a=1`
    const res = await fetch(url)
      .then((url) => url.json())
      .catch((err) => {
        console.error(err)
        originalMessage.channel.send(
          `**:x: Something went wrong! Try again later...**`
        )
      })

    if (!res) {
      return
    }

    if (!res.graphql.user.username) {
      originalMessage.channel
        .send(
          `**${originalMessage.author.username}, I couldn't find that account... :(**`
        )
        .then((m) => m.delete({ timeout: 5000 }))

      return
    }

    const account = res.graphql.user

    const embed = new MessageEmbed()
      .setColor('#4360FB')
      .setTitle(account.full_name)
      .setURL(account.external_url_linkshimmed)
      .setThumbnail(account.profile_pic_url_hd)
      .addField(
        '**Profile information**',
        stripIndents`**- Username:** ${account.username}
    **- Full name:** ${account.full_name}
    **- Biography:** ${
      account.biography.length === 0 ? 'none' : account.biography
    }
    **- Posts:** ${account.edge_owner_to_timeline_media.count}
    **- Followers:** ${account.edge_followed_by.count}
    **- Following:** ${account.edge_follow.count}
    **- Private account:** ${
      account.is_private ? 'Yes :closed_lock_with_key:' : 'No :unlock:'
    }`
      )

    originalMessage.channel.send(embed)
  }

  hasPermissionToRun(): boolean {
    return true
  }
}
