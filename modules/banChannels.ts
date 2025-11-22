import type { MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

const allowedGroups = (process.env.ALLOWED_GROUPS ?? "")
  .split(";")
  .map(groupId => parseInt(groupId, 10));

function checker(update: MessageContext) {
  return update.sender.type === "chat" && !allowedGroups.includes(update.sender.id);
}

async function handler(update: MessageContext, api: Api) {
  api.log.info(`user ${update.sender.displayName} banned`);
  await update.delete();
  await update.client.banChatMember({ chatId: update.chat.id, participantId: update.sender.id });
}

export default {
  checker,
  eventName: "new_message",
  handler,
};
