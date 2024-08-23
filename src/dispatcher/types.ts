import type { MessageContext } from '@mtcute/dispatcher'

export interface MessageHandler {
  event_name: 'new_message' // TODO: use addUpdateHandler and add other types
  checker: (update: MessageContext) => boolean
  handler: (update: MessageContext, api: any) => void
}
