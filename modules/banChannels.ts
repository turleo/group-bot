import type { MessageContext } from '@mtcute/dispatcher'
import type { Api } from '~/src/api/types'
import { Message } from '@mtcute/core'

const allowedGroups = (process.env['ALLOWED_GROUPS'] ?? '')
    .split(';')
    .map((x) => parseInt(x))

function checker(update: MessageContext) {
  return update.sender.type == 'chat' && !allowedGroups.includes(update.sender.id)
}

function handler(update: MessageContext, api: Api) {
  api.log.info(`user ${update.sender.id} banned`)
  update.delete()
  update.client.banChatMember({ chatId: update.chat.id, participantId: update.sender.id })
}

export default  {
  event_name: 'new_message',
  checker,
  handler
}

