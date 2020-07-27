import { config } from 'dotenv'
import { Router, Request, Response, NextFunction } from 'express'
import FormData from 'form-data'
import fetch from 'node-fetch'

config()

export default class Middleware {
  readonly router: Router

  /**
   * Middleware discord oauth
   */
  constructor() {
    this.router = Router()
    this.initRoutes()
  }

  /**
   * Check if user's authenticated
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public checkIfAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.session.user) return res.redirect('/authorize')
    else return next()
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
      if (req.session.user) return res.redirect('/')

      const authorizeUrl = process.env.AUTH_URL
      res.redirect(authorizeUrl)
    })

    this.router.get('/callback', (req, res) => {
      if (req.session.user) return res.redirect('/')

      const accessCode = req.query.code
      if (!accessCode) throw new Error('No access code returned from Discord')

      const data = new FormData()
      data.append('client_id', process.env.ID)
      data.append('client_secret', process.env.SECRET)
      data.append('grant_type', 'authorization_code')
      data.append('redirect_uri', process.env.REDIRECT_URI)
      data.append('scope', 'identify guilds')
      data.append('code', accessCode)

      fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        body: data,
      })
        .then((res) => res.json())
        .then((response) => {
          fetch('https://discordapp.com/api/users/@me', {
            method: 'GET',
            headers: {
              authorization: `${response.token_type} ${response.access_token}`,
            },
          })
            .then((res2) => res2.json())
            .then((userResponse) => {
              userResponse.tag = `${userResponse.username}#${userResponse.discriminator}`
              userResponse.avatarURL = userResponse.avatar
                ? `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.png?size=1024`
                : null

              req.session.user = userResponse
              res.redirect('/')
            })
            .catch((err) => {
              console.error(err)
            })
        })
        .catch((err) => {
          console.error(err)
        })
    })

    this.router.get('/logout', this.checkIfAuth, (req, res) => {
      req.session.destroy((err) => {
        if (err) console.error(err)

        return res.redirect('/')
      })
    })
  }
}
