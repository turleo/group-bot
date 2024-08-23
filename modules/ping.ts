import type { MessageContext } from '@mtcute/dispatcher'
import type { Api } from '~/src/api/types'
import { Message } from '@mtcute/core'

function checker(update: MessageContext) {
  return update.text.startsWith('/ping')
}

function handler(update: MessageContext, api: Api) {
  api.log.debug(`${update.sender.displayName} pinged`)
  return update.replyText('🏓 Pong')
}

export default  {
  event_name: 'new_message',
  checker,
  handler
}
