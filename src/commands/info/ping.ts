import { Command } from '@structures/Command'

export default new Command({
  name: 'ping',
  aliases: ['p'],
  description: 'replies with pong',
  slash: 'both',
  run: async ({ client }) => {
    return `🏓 Pong!\nLatency is \`${client.ws.ping}\`ms`
  },
})
