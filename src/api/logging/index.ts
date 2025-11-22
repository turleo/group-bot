import type { TelegramClient } from "@mtcute/bun";

import type { Logging } from "./types";

export default (bot: TelegramClient): Logging => {
  function error(message: string) {
    bot.log.error(message);
  }
  function warning(message: string) {
    bot.log.warn(message);
  }
  function info(message: string) {
    bot.log.info(message);
  }
  function debug(message: string) {
    bot.log.debug(message);
  }

  return {
    debug,
    error,
    info,
    warning,
  };
};
