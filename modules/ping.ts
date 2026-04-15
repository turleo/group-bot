import type { MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

function checker(update: MessageContext) {
  return update.text.startsWith("/ping");
}

function handler(update: MessageContext, api: Api) {
  api.log.debug(`${update.sender.displayName} pinged`);
  const commitHash = Bun.env.COMMIT_HASH ?? "HEAD";
  return update.replyText({
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

export default {
  checker,
  eventName: "new_message",
  handler,
};
