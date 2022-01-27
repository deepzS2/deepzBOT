import {
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
} from 'discord.js'

type ArgumentObject = string[] | CommandInteractionOptionResolver
type ArgumentTypes = 'string' | 'integer' | 'mention'

interface ArgumentOptions {
  argumentName: string
  index?: number
  message?: Message
}

function getArgument(
  type: 'string',
  obj: ArgumentObject,
  options: ArgumentOptions
): string
function getArgument(
  type: 'integer',
  obj: ArgumentObject,
  options: ArgumentOptions
): number
function getArgument(
  type: 'mention',
  obj: ArgumentObject,
  options: ArgumentOptions
): GuildMember
function getArgument(
  type: ArgumentTypes,
  obj: ArgumentObject,
  options: ArgumentOptions
): string | number | GuildMember {
  if (obj instanceof CommandInteractionOptionResolver) {
    switch (type) {
      case 'string':
        return obj.getString(options.argumentName)
      case 'mention':
        return obj.getMentionable(options.argumentName) as GuildMember
      case 'integer':
        return obj.getInteger(options.argumentName)
      default:
        return obj.getString(options.argumentName)
    }
  }

  if (obj.length > 0) {
    switch (type) {
      case 'mention':
        return options.message?.mentions.members.first()
      case 'string':
        return obj[options.index]
      case 'integer': {
        const parsed = parseInt(obj[options.index])
        return isNaN(parsed) && parsed
      }
    }
  }

  return null
}

export default getArgument
