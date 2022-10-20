import TwitchApi from 'node-twitch'

import { twitchApiKey, twitchApiSecret } from '@deepz/config'

const twitch = new TwitchApi({
  client_id: twitchApiKey,
  client_secret: twitchApiSecret,
})

export default twitch
