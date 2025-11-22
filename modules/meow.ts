import type { MessageContext } from "@mtcute/dispatcher";

function checker(update: MessageContext) {
  return /^(?:[Мм](?:[яувкрЯъУКВРЪ]){1,}){1,}/u.exec(update.text);
}

function handler(update: MessageContext) {
  return update.replyText("Мяу");
}

export default {
  checker,
  eventName: "new_message",
  handler,
};
