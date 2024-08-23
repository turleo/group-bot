import type { TelegramClient } from '@mtcute/bun'
import type { Logging } from './types'

export default (bot: TelegramClient): Logging => {
  const error = (message: any) => {
    console.error(message)
  }
  const warning = (message: any) => {
    console.log(message)
  }
  const info = (message: any) => {
    console.log(message)
  }
  const debug = (message: any) => {
    console.log(message)
  }

  return {
    error,
    warning,
    info,
    debug
  }
}
