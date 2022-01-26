import { Message, GuildMember } from 'discord.js'

// import { client } from '.'

export const functions = {
  /**
   * Get member with the params
   * @param msg Message
   * @param toFind String with the mention
   */
  getMember: function (msg: Message, toFind = ''): GuildMember {
    toFind = toFind.toLowerCase()

    let target = msg.guild.members.cache.get(toFind)

    if (!target && msg.mentions.members) target = msg.mentions.members.first()

    if (!target && toFind) {
      target = msg.guild.members.cache.find((member) => {
        return (
          member.displayName.toLowerCase().includes(toFind) ||
          member.user.tag.toLowerCase().includes(toFind)
        )
      })
    }

    if (!target) target = msg.member

    return target
  },
  // getUserFromMention: function (mention: string) {
  //   if (!mention) return

  //   const matches = mention.match(MessageMentions.USERS_PATTERN)

  //   if (!matches) return

  //   const id = matches[1]

  //   return client.users.cache.get(id)
  // },
  formatDate: function (date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date)
  },
}
