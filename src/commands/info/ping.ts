import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import type { RunOptions } from '@deepz/types/index'

@Command({
  name: 'ping',
  description: 'Replies with pong...',
  category: 'INFO',
})
export default class PingCommand extends BaseCommand {
  async run({
    client,
  }: RunOptions): Promise<string | CustomMessageEmbed | MessagePayload> {
    return `🏓 Pong!\nLatency is \`${client.ws.ping}\`ms`
  }
}
