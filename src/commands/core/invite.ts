import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'

@Command({
  name: 'invite',
  description: 'Displays the information about the bot!',
  category: 'CORE',
})
export default class InviteCommand extends BaseCommand {
  private readonly INVITE_URL =
    'https://discord.com/oauth2/authorize?client_id=709564503053828137&scope=bot&permissions=334621766'

  async run(): Promise<string | CustomMessageEmbed | MessagePayload> {
    return `**Here's my invite: ${this.INVITE_URL}**`
  }
}
