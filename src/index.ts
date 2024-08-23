import { TelegramClient, html } from '@mtcute/bun'
import { Dispatcher } from '@mtcute/dispatcher'
import { importModules } from './dispatcher/dispatcher'
import { Api } from './api'

import type { MessageHandler } from './dispatcher/types'

if (typeof process.env.API_ID !== 'string' || typeof process.env.API_HASH !== 'string') {
  throw new TypeError()
}

const tg = new TelegramClient({
  apiId: parseInt(process.env.API_ID!),
  apiHash: process.env.API_HASH!
})

const self = await tg.start({
  botToken: process.env.BOT_TOKEN
})
const dp = Dispatcher.for(tg)

const api = Api(tg)

importModules(dp, api)

