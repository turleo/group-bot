import { TelegramClient } from "@mtcute/bun";
import { LogManager } from "@mtcute/bun/utils.js";
import { Dispatcher } from "@mtcute/dispatcher";

import { api } from "./api";
import type { Api as ApiType } from "./api/types";
import { importModules } from "./dispatcher/dispatcher";

if (typeof process.env.API_ID !== "string" || typeof process.env.API_HASH !== "string") {
  throw new TypeError();
}

const tg: TelegramClient = new TelegramClient({
  apiHash: process.env.API_HASH,
  apiId: parseInt(process.env.API_ID, 10),
  logLevel: LogManager.INFO,
});

const self = await tg.start({
  botToken: process.env.BOT_TOKEN,
});
const dp = Dispatcher.for(tg);

const globalApi: ApiType = api(tg, process.env);

globalApi.log.info(`🔥 Starting bot as @${self.username ?? "???"}`);

await importModules(dp, globalApi);
