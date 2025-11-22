import type { TelegramClient } from '@mtcute/bun'
import type { Api as ApiType } from './types'

export const Api = (tg: TelegramClient, config: Record<string, unknown>): ApiType => {
  return {
    log: require('./logging').default(tg),
    tg,
    config,
  }
}

