import { Dispatcher, type MessageContext } from "@mtcute/dispatcher";

const regexMap = [
  {
    regex: /^(?:[м](?:[яувкръ]){1,}){1,}.*/uis,
    response: "Мяу",
  },
];

async function handler(update: MessageContext) {
  const match = regexMap.find(regex => regex.regex.exec(update.text));
  if (match) {
    const answer = update.text.replace(match.regex, match.response);
    await update.replyText(answer);
  }
}

export function init() {
  const dp = Dispatcher.child();
  dp.onNewMessage(handler);
  return dp;
}
