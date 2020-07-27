/* eslint-disable new-cap */

import { Client } from 'discord.js'
import { Router } from 'express'
import { readdir, readdirSync } from 'fs'

import { Users } from '@database'

import Middleware from './middleware'

export default class Routes {
  readonly bot: Client
  readonly router: Router
  readonly middleware: Middleware

  /**
   * Initialize routes
   * @param bot Client instance
   */
  constructor(bot: Client) {
    this.bot = bot
    this.router = Router()
    this.middleware = new Middleware()

    this.initRoutes()
  }

  /**
   * Returns the router
   */
  public getRoutes(): Router {
    return this.router
  }

  /**
   * Create the routes
   */
  private initRoutes() {
    this.router.get('/', (req, res) => {
      res.render('index', {
        pageTitle: 'Dashboard',
        user: req.session.user || null,
        botAvatar: this.bot.user.displayAvatarURL({ dynamic: true }),
      })
    })

    this.router.get('/about', (req, res) => {
      res.render('about', {
        pageTitle: 'About',
        user: req.session.user || null,
        botAvatar: this.bot.user.displayAvatarURL({ dynamic: true }),
      })
    })

    this.router.get('/commands', async (req, res) => {
      const [commands, categories] = await this.getFiles()

      res.render('commands', {
        pageTitle: 'Commands',
        user: req.session.user || null,
        botAvatar: this.bot.user.displayAvatarURL({ dynamic: true }),
        categories,
        commands,
      })
    })

    this.router.get('/profile', async (req, res) => {
      if (!req.session.user) {
        return res.redirect('/authorize')
      }

      let user = await Users().where('id', '=', req.session.user.id).first()

      if (!user) {
        user = await Users().insert({
          id: req.session.user.id,
          username: req.session.user.username,
        })
      }

      let level = 1
      let up_xp = 433
      let actual_xp = user.xp

      while (actual_xp >= up_xp) {
        up_xp = level * 433
        actual_xp -= level * 433
        level++
      }

      Object.assign(user, {
        level,
        up_xp,
        actual_xp,
        widthProgressBar: ((actual_xp / up_xp) * 100).toFixed(2),
        dcInfos: req.session.user,
      })

      res.render('profile', {
        pageTitle: 'Profile',
        user,
        botAvatar: this.bot.user.displayAvatarURL({ dynamic: true }),
      })
    })

    this.router.use('/authorize', this.middleware.getRoutes())
  }

  /**
   * Get commands and categories
   */
  private getFiles(): Promise<Array<unknown>> {
    const commandClasses = []
    const categories = []

    return new Promise((resolve, reject) => {
      readdir(
        process.env.NODE_ENV === 'prod'
          ? './dist/bot/commands'
          : './src/bot/commands',
        (err, dir) => {
          if (err) reject(err)

          dir.forEach((value) => {
            categories.push(value)

            const commandsFiles = readdirSync(
              process.env.NODE_ENV === 'prod'
                ? `./dist/bot/commands/${value}/`
                : `./src/bot/commands/${value}/`
            )

            for (const file of commandsFiles) {
              const pull = require(`../bot/commands/${value}/${
                file.split('.')[0]
              }`)

              commandClasses.push({
                category: value,
                command: new pull.default().commandUsage,
              })
            }
          })

          resolve([commandClasses, categories])
        }
      )
    })
  }
}
