import { Command } from '@deepz/structures'

export default new Command({
  name: 'ping',

  description: 'replies with pong',
  category: 'INFO',

  examples: ['d.ping'],
  run: async ({ client }) => {
    return `🏓 Pong!\nLatency is \`${client.ws.ping}\`ms`
  },
})
