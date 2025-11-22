import type { TelegramClient } from '@mtcute/bun';
import type { Logging } from './logging/types'

export interface Api {
  log: Logging,
  tg: TelegramClient,
  config: Record<string, unknown>,
}

