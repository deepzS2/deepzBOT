/**
 * Bot configurations options
 */
export interface BotConfig {
  /**
   * @property Token provided by Discord Developers
   */
  token?: string

  /**
   * @property Commands prefix
   */
  prefix?: string

  /**
   * @property Bot owner role name
   */
  botOwnerRoleName: string

  /**
   * @property Reactions for the commands
   */
  enableReactions: boolean
}
