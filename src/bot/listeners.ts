import { stripIndents } from 'common-tags'
import {
  Message,
  TextChannel,
  Guild,
  User,
  MessageReaction,
  PartialUser,
  Client,
} from 'discord.js'

import { BotConfig } from '@customTypes/client'
import { Guilds, Users } from '@database'
import Twitch from '@utils/twitch'

import Server from '../server'
import { CommandHandler } from './handler'
// import github from '@utils/github'

export default class Listeners {
  readonly client: Client
  readonly config: BotConfig
  readonly server: Server | undefined
  readonly commandHandler: CommandHandler
  readonly twitch: Twitch

  /**
   * Listeners class for a better organization
   * @param client The bot instance
   * @param config Token and other configs
   * @param server Web server (soon)
   */
  public constructor(client: Client, config: BotConfig, server?: Server) {
    this.client = client
    this.config = config
    this.server = server
    this.twitch = new Twitch(this.client)
    this.commandHandler = new CommandHandler(this.config.prefix, this.client)
  }

  /**
   * Start the listeners
   */
  public start(): void {
    this.client.once('disconnect', () => {
      console.log('Disconnect!')
    })

    this.client.on('error', (e) => {
      console.error('Discord client error!', e)
    })

    this.client.on('message', (msg) => {
      this.message(msg)
    })

    this.client.on('messageReactionAdd', (msgReaction, user) => {
      this.messageReactionAdd(msgReaction, user)
    })

    this.client.on('messageReactionRemove', (msgReaction, user) => {
      this.messageReactionRemove(msgReaction, user)
    })

    this.client.on('guildCreate', (guild) => {
      this.guildCreate(guild)
    })

    this.client.on('guildDelete', (guild) => {
      this.onGuildDelete(guild)
    })

    this.client.once('ready', () => {
      this.ready()
    })

    console.log(`Everything okay, listeners ready!`)
  }

  /**
   * Check if user exists
   * @param id The user discord ID
   * @param username The user discord username
   */
  private async checkIfUserExists(id: string, username: string) {
    try {
      const user = await Users()
        .where({
          id: id,
        })
        .select('*')
        .first()

      if (!user) {
        await Users().insert(
          {
            id: id,
            username: username,
          },
          '*'
        )
      } else if (user.username !== username) {
        await Users().where('id', '=', id).update(
          {
            username: username,
          },
          '*'
        )
      }

      return await Users().where('id', '=', id).select('*').first()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Update the xp and balance when the user sends a message
   * @param message The message informations
   */
  private async onMessage(message: Message) {
    if (message.author.bot) {
      return
    }

    const user = await this.checkIfUserExists(
      message.author.id,
      message.author.username
    )

    if (user) {
      await Users()
        .where('id', '=', message.author.id)
        .update({
          xp: user.xp + Math.floor(Math.random() * 15) + 10,
          balance: user.balance + Math.floor(Math.random() * 7) + 3,
        })
    }
  }

  /**
   * When the bot is added to a guild
   * @param guild Guild information
   */
  private async onGuildAdd(guild: Guild): Promise<void> {
    await Guilds().insert({
      id: guild.id,
      name: guild.name,
    })
  }

  /**
   * When the bot is excluded from some guild or when the guild is deleted
   * @param guild Guild information
   */
  private async onGuildDelete(guild: Guild): Promise<void> {
    await Guilds().where('id', '=', guild.id).delete()
  }

  /**
   * Check if the reaction is on the message with the role reaction function
   * @param msg The message reacted
   * @param user User reacted
   * @param action The user reacted or removed the reaction from before?
   * @param callback The callback for error handling
   */
  private async reactions(
    msg: MessageReaction,
    user: User,
    action: string,
    callback: (err?: Error) => void
  ) {
    try {
      const { roleMessage, roles } = await Guilds()
        .where('id', '=', msg.message.guild.id)
        .first()

      if (msg.message.id !== roleMessage) {
        return
      }

      const { role } = roles.find((value) => value.emoji === msg.emoji.name)

      const guildRole = await msg.message.guild.roles.fetch(role)

      if (action === 'add') {
        await msg.message.guild.member(user.id).roles.add(guildRole)
      } else {
        await msg.message.guild.member(user.id).roles.remove(guildRole)
      }
    } catch (error) {
      console.error(error)
      callback(error)
    }
  }

  /**
   * Start the bot and his activities (Web server soon!)
   */
  private async ready(): Promise<void> {
    const PORT = process.env.PORT || 3000

    const activities =
      process.env.NODE_ENV === 'prod'
        ? [
            "try 'd.help' command",
            'made with TypeScript',
            'under development...',
            'a bot made for you! :smiley:',
            'my website will be on soon :relaxed:',
          ]
        : [
            'bot under development, commands not working',
            'commands not working, under development',
            'my developer is upgrading me :flushed:',
          ]

    const types: Array<'PLAYING' | 'STREAMING' | 'WATCHING' | 'LISTENING'> = [
      'PLAYING',
      'STREAMING',
      'WATCHING',
      'LISTENING',
    ]

    setInterval(() => {
      const activity =
        activities[Math.floor(Math.random() * (activities.length - 1) + 1)]
      const type =
        types[Math.floor(Math.random() * (activities.length - 1) + 1)]

      this.client.user.setActivity(activity, {
        type,
      })
    }, 60 * 1000)

    await this.twitch.tickTwitchCheck()
    setInterval(async () => {
      await this.twitch.tickTwitchCheck()
    }, 1000 * 60 * 30)

    console.log('Bot ready and listening!')

    // Listening web server :D
    if (this.server) {
      this.server.start(PORT)
    }

    // Uncomment if you use this repository to make your own bot, and tell to the users when u update!
    // await github(this.client)
  }

  /**
   * On message, the basic of the discord.js, the bot will updated the stats with a random number on the balance and xp, after that will execute the command (if it is one)
   * @param message The message information
   */
  private async message(message: Message): Promise<void> {
    if (process.env.NODE_ENV !== 'prod') {
      await this.onMessage(message)

      if (message.author.id === '411557789068951552') {
        this.commandHandler.handleMessage(message)
      }

      return
    }

    await this.onMessage(message)
    this.commandHandler.handleMessage(message)
  }

  /**
   * The listener to the message reaction add
   * @param msg Message reaction
   * @param user User reacted
   */
  private async messageReactionAdd(
    msg: MessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    await this.reactions(msg, user as User, 'add', (err) => {
      if (err) {
        msg.message.channel.send(`**:x: ${err.message}**`)
      }
    })
  }

  /**
   * The listener to the message reaction remove
   * @param msg Message reaction
   * @param user User reacted
   */
  async messageReactionRemove(
    msg: MessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    await this.reactions(msg, user as User, 'remove', (err) => {
      if (err) {
        msg.message.channel.send(`**:x: ${err.message}**`)
      }
    })
  }

  /**
   * The listener when the bot is added to a guild
   * @param guild Guild information
   */
  async guildCreate(guild: Guild): Promise<void> {
    let found = 0
    guild.channels.cache.map((c) => {
      if (found === 0) {
        if (c.type === 'text') {
          if (c.permissionsFor(this.client.user).has('VIEW_CHANNEL') === true) {
            if (
              c.permissionsFor(this.client.user).has('SEND_MESSAGES') === true
            ) {
              ;(c as TextChannel).send(stripIndents`
              **Thanks for adding me!! My name is deepz**
              It's a honor being invited to your server! I hope we all can be friends forever :smiley:.
              For help with commands try \`d.help\` or \`d.help <command>\`.
              `)
              found = 1
            }
          }
        }
      }
    })

    await this.onGuildAdd(guild)
  }
}
