import { MessagePayload } from 'discord.js'

import { Command } from '@deepz/decorators'
import { BaseCommand, CustomMessageEmbed } from '@deepz/structures'
import { RunOptions } from '@deepz/types/command'

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

// export default new Command({
//   name: 'ping',

//   description: 'replies with pong',
//   category: 'INFO',

//   examples: ['d.ping'],
//   run: async ({ client }) => {
//
//   },
// })
