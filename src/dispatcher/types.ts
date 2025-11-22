import type { MessageContext } from "@mtcute/dispatcher";

import type { Api } from "@/api/types";

export interface MessageHandler {
  // TODO: use addUpdateHandler and add other types
  eventName: "new_message";
  checker: (update: MessageContext) => boolean;
  handler: (update: MessageContext, api: Api) => void;
}
