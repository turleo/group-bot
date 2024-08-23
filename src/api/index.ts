import type { TelegramClient } from '@mtcute/bun'
import type { Api as ApiType } from './types'

export const Api = (tg: TelegramClient): ApiType => {
  return {
    log: require('./logging').default(tg)
  }
}

