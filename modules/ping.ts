import { Dispatcher, filters, type MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

async function handler(update: MessageContext, api: Api) {
  api.log.debug(`${update.sender.displayName} pinged`);
  const commitHash = Bun.env.COMMIT_HASH ?? "HEAD";
  await update.replyText({
    entities: [
      {
        // eslint-disable-next-line id-length
        _: "messageEntityTextUrl" as const,
        length: commitHash.length,
        offset: 9,
        url: `https://github.com/turleo/group-bot/commit/${commitHash}`,
      },
    ],
    text: `🏓 Pong \n${commitHash}`,
  });
}

export function init(api: Api) {
  const dp = Dispatcher.child<{ api: Api }>();
  dp.onNewMessage(filters.command("ping"), async (update) => {
    await handler(update, api);
  });
  return dp;
}
