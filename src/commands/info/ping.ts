import {Command} from '../../structures/Command'

export default new Command({
  name: 'ping',
  description: 'replies with pong',
  slash: 'both',
  run: async () => {
    return 'Pong'
  },
})
