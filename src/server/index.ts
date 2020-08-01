import { Client } from 'discord.js'
import express, { Express } from 'express'
import ejsLayouts from 'express-ejs-layouts'
import session from 'express-session'
import passport from 'passport'
import path from 'path'

import Routes from './routes'

export default class WebDashboard {
  readonly app: Express
  readonly client: Client

  /**
   * Initialize the server
   * @param client Client instance
   */
  constructor() {
    this.app = express()
    this.client = new Client()

    const PORT = process.env.PORT || 3000

    this.start(PORT)
      .then(() => {
        console.log('Server ready')
      })
      .catch((err) => {
        console.error(err)
      })
  }

  /**
   * Starts the server!
   * @param port Port to listen
   */
  public async start(port: number | string): Promise<void> {
    this.ejsConfigurations()
    this.oAuthConfigurations()
    // this.jsonConfigurations()

    this.initRoutes()
    await this.client.login(process.env.TOKEN)

    this.app.listen(port, () => {
      console.log(`Server started! Listening to ${port}`)
    })
  }

  /**
   * EJS configs
   */
  private ejsConfigurations() {
    this.app.use(express.static(path.join(__dirname, 'assets')))
    this.app.set('view engine', 'ejs')
    this.app.use(ejsLayouts)
    this.app.set('views', path.join(__dirname, 'views'))
  }

  /**
   * Initialize routes
   */
  private initRoutes() {
    const routes = new Routes(this.client)

    this.app.use(routes.getRoutes())
  }

  /**
   * OAuth configs
   */
  private oAuthConfigurations() {
    this.app.use(passport.initialize())
    this.app.use(
      session({
        secret: process.env.SECRET_API,
        resave: false,
        saveUninitialized: false,
      })
    )
  }

  /**
   * JSON (optional)
   */
  private jsonConfigurations() {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }
}

new WebDashboard()
