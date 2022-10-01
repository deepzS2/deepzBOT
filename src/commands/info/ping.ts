import { Command } from '@deepz/structures'

export default new Command({
  name: 'ping',
  aliases: ['p'],
  description: 'replies with pong',
  category: 'INFO',
  slash: 'both',
  examples: ['d.ping'],
  run: async ({ client }) => {
    return `🏓 Pong!\nLatency is \`${client.ws.ping}\`ms`
  },
})
