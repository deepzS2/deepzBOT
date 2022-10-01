import {
  BaseMessageOptions,
  Message,
  MessagePayload,
  InteractionReplyOptions,
  CommandInteraction,
} from 'discord.js'

/**
 * It sends a message to a channel
 * @param options - With the message object and content of the message
 * @returns A Promise that resolves to a Message or null.
 */
export async function sendMessage(options: {
  message?: Message | CommandInteraction
  content?:
    | MessagePayload
    | BaseMessageOptions
    | InteractionReplyOptions
    | string
}): Promise<Message<boolean>> {
  if (!options.message || !options.content) return

  if (isMessageInteraction(options.message)) {
    return (await options.message.followUp(
      options.content as InteractionReplyOptions | MessagePayload | string
    )) as Message<boolean>
  } else {
    return await options.message.channel.send(
      options.content as MessagePayload | BaseMessageOptions | string
    )
  }
}

const isMessageInteraction = (
  message: Message | CommandInteraction
): message is CommandInteraction => {
  return 'followUp' in message
}
