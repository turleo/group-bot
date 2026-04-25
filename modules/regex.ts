import { Dispatcher, type MessageContext } from "@mtcute/dispatcher";

const regexMap = [
  {
    regex: /^(?:[м](?:[яувкръ]){1,}){1,}.*/uis,
    response: "Мяу",
  },
  {
    // eslint-disable-next-line prefer-named-capture-group
    regex: /.*?([а-я]*[см]((ен(ь|((е|ё)в)))|(я|ю)ня)).*/uis,
    response: "$1 moment",
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
