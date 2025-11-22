import { TelegramClient } from '@mtcute/bun'
import { Dispatcher } from '@mtcute/dispatcher'
import { importModules } from './dispatcher/dispatcher'
import { Api } from './api'
import { LogManager } from '@mtcute/bun/utils.js'

if (typeof process.env.API_ID !== 'string' || typeof process.env.API_HASH !== 'string') {
  throw new TypeError()
}

const tg = new TelegramClient({
  apiId: parseInt(process.env.API_ID!),
  apiHash: process.env.API_HASH!,
  logLevel: LogManager.INFO,
})

const self = await tg.start({
  botToken: process.env.BOT_TOKEN
})
const dp = Dispatcher.for(tg)

const api = Api(tg, process.env)

api.log.info(`🔥 Starting bot as @${self.username}`)

importModules(dp, api)

