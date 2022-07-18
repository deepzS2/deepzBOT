import {
  ColorResolvable,
  EmbedAuthorData,
  EmbedField,
  EmbedBuilder,
  EmbedFooterData,
} from 'discord.js'

import { embedGlobalColor } from '@deepz/config'

interface EmbedOptions {
  color?: ColorResolvable
  description?: string
  thumbnail?: string
  image?: string
  url?: string
  fields?: EmbedField[]
  footer?: EmbedFooterData
  author?: EmbedAuthorData
  timestamp?: number | Date | boolean
}

/**
 * Custom message embed class
 * So it's easy to create a embed
 */
export default class CustomMessageEmbed extends EmbedBuilder {
  constructor(title: string, options?: EmbedOptions) {
    super()

    this.setTitle(title)
    this.setColor(options.color || embedGlobalColor)

    if (options.description) this.setDescription(options.description)

    if (options.thumbnail) this.setThumbnail(options.thumbnail)

    if (options.url) this.setURL(options.url)

    if (options.footer) this.setFooter(options.footer)

    if (options.author) this.setAuthor(options.author)

    if (options.fields) this.addFields(options.fields)

    if (options.timestamp)
      this.setTimestamp(
        typeof options.timestamp === 'boolean' ? Date.now() : options.timestamp
      )

    if (options.image) this.setImage(options.image)
  }
}
