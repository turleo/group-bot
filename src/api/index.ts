import type { TelegramClient } from "@mtcute/bun";

import logging from "./logging";
import type { Api as ApiType } from "./types";

export function api(tg: TelegramClient, config: Record<string, unknown>): ApiType {
  return {
    config,
    log: logging(tg),
    tg,
  };
}
