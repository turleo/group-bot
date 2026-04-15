import { Dispatcher, type MessageContext } from "@mtcute/dispatcher";

const regexMap = [
  {
    regex: /^(?:[Мм](?:[яувкрЯъУКВРЪ]){1,}){1,}.*/u,
    response: "Мяу",
  },
  {
    // eslint-disable-next-line prefer-named-capture-group
    regex: /([а-яА-Я]*(а|е)[а-яА-Я]*[смСМ]((ен(ь|((е|ё)в|(Е|Ё)В)))|(я|ю)ня))/dgui,
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
