import type { TelegramClient } from '@mtcute/bun'
import type { Logging } from './types'

export default (bot: TelegramClient): Logging => {
  const error = (message: any) => {
    bot.log.error(message)
  }
  const warning = (message: any) => {
    bot.log.warn(message)
  }
  const info = (message: any) => {
    bot.log.info(message)
  }
  const debug = (message: any) => {
    bot.log.debug(message)
  }

  return {
    error,
    warning,
    info,
    debug
  }
}
