import {
  MessageOptions,
  Message,
  MessagePayload,
  InteractionReplyOptions,
} from 'discord.js'

import { ExtendedInteraction } from '@deepz/types/command'

/**
 * It sends a message to a channel
 * @param options - With the message object and content of the message
 * @returns A Promise that resolves to a Message or null.
 */
export async function sendMessage(options: {
  message?: Message | ExtendedInteraction
  content?: MessagePayload | MessageOptions | InteractionReplyOptions | string
}): Promise<null | Message<boolean>> {
  if (!options.message || !options.content) return

  if (isMessageInteraction(options.message)) {
    return (await options.message.followUp(
      options.content as InteractionReplyOptions | MessagePayload | string
    )) as Message<boolean>
  } else {
    return await options.message.channel.send(
      options.content as MessagePayload | MessageOptions | string
    )
  }
}

const isMessageInteraction = (
  message: Message | ExtendedInteraction
): message is ExtendedInteraction => {
  return (<ExtendedInteraction>message).followUp !== undefined
}
