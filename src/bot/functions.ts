import { Message, GuildMember } from 'discord.js'

export default {
  /**
   * Get member with the params
   * @param msg Message
   * @param toFind String with the mention
   */
  getMember: function (msg: Message, toFind = ''): GuildMember {
    toFind = toFind.toLowerCase()

    let target = msg.guild.member(toFind)

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
  formatDate: function (date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date)
  },
}
