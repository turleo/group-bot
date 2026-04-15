import { Dispatcher, filters, MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

import { handleMessage } from "./voiceToTextModule";

const checker = filters.or(filters.voice, filters.roundMessage);

async function handler(update: MessageContext, api: Api) {
  await handleMessage(update, api);
}

export function init(api: Api) {
  const dp = Dispatcher.child();
  dp.onNewMessage(checker, async (update) => {
    await handler(update as MessageContext, api);
  });
  return dp;
}
