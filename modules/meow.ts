import type { MessageContext } from '@mtcute/dispatcher'
import type { Api } from '~/src/api/types'
import { Message } from '@mtcute/core'

function checker(update: MessageContext) {
  return /^([Мм]([яувкрЯъУКВРЪ]){1,}){1,}/.exec(update.text)
}

function handler(update: MessageContext, api: Api) {
  return update.replyText('Мяу')
}

export default  {
  event_name: 'new_message',
  checker,
  handler
}
