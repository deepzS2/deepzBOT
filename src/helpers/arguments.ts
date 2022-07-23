import { CommandInteractionOptionResolver, Message } from 'discord.js'

type ArgumentObject = string[] | CommandInteractionOptionResolver

/**
 * It checks if the arguments is the type of CommandInteractionOptionResolver
 * @param {ArgumentObject} args - ArgumentObject
 * @returns A function that takes an argument of type ArgumentObject and returns a boolean.
 */
export function isInteraction(
  args: ArgumentObject
): args is CommandInteractionOptionResolver {
  return 'data' in args
}

/**
 * It takes a message and returns the members that were mentioned in that message
 * @param {Message} message - Message
 * @returns A collection of members that were mentioned in the message.
 */
export function getMentions(message: Message) {
  return message.mentions.users
}
