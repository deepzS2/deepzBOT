import { Command } from '@structures'

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=709564503053828137&scope=bot&permissions=334621766'

export default new Command({
  name: 'invite',
  description: 'Displays the information about the bot!',
  category: 'CORE',
  slash: 'both',
  run: async () => {
    return `**Here's my invite: ${INVITE_URL}**`
  },
})
