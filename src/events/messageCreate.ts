import {CommandType} from '../@types/command'
import {botConfig} from '../config'
import {client} from '../index'
import {Event} from '../structures/Event'

export default new Event('messageCreate', async (message) => {
  const {prefix} = botConfig

  if (!message.author.bot && message.content.startsWith(prefix)) {
    if (message.channel.type === 'DM') return

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    const cmd: CommandType = client.commands.get(command)

    if (!cmd) return

    message.channel.sendTyping()

    const response = await cmd.run({
      args,
      client,
      message,
    })

    if (response && typeof response === 'string') message.channel.send(response)
  }
})
