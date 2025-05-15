import type { MessageContext } from '@mtcute/dispatcher'
import type { Api } from '~/src/api/types'

// TODO: move this to config
function checker(update: MessageContext) {
  return /([а-яА-Я]*(а|е)[а-яА-Я]*[смСМ]((ен(ь|((е|ё)в|(Е|Ё)В)))|(я|ю)ня))/dgui.exec(update.text)
}

function handler(update: MessageContext, api: Api) {
  const group = checker(update)?.[1]
  return update.replyText(`${group} moment`)
}

export default  {
  event_name: 'new_message',
  checker,
  handler
}
