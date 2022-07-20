import { Command } from '@structures'

export default new Command({
  name: 'ping',
  aliases: ['p'],
  description: 'replies with pong',
  category: 'INFO',
  slash: 'both',
  run: async ({ client }) => {
    return `🏓 Pong!\nLatency is \`${client.ws.ping}\`ms`
  },
})
