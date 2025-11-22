import type { MessageContext } from "@mtcute/dispatcher";

// TODO: move this to config
function checker(update: MessageContext) {
  // eslint-disable-next-line prefer-named-capture-group
  return /([а-яА-Я]*(а|е)[а-яА-Я]*[смСМ]((ен(ь|((е|ё)в|(Е|Ё)В)))|(я|ю)ня))/dgui.exec(update.text);
}

function handler(update: MessageContext) {
  const group = checker(update)?.[1];
  return update.replyText(`${group ?? "😳"} moment`);
}

export default {
  checker,
  eventName: "new_message",
  handler,
};
