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
  constructor(client: Client) {
    this.app = express()
    this.client = client
  }

  /**
   * Starts the server!
   * @param port Port to listen
   */
  public start(port: number | string): void {
    this.ejsConfigurations()
    this.oAuthConfigurations()
    // this.jsonConfigurations()

    this.initRoutes()

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
