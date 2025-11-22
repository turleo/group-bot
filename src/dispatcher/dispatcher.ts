import type { Dispatcher } from "@mtcute/dispatcher";
import { Glob } from "bun";

import type { Api } from "@/api/types";

import type { MessageHandler } from "./types";

async function importFromPath(dp: Dispatcher, api: Api, path: string) {
  const glob = new Glob("**/*.ts");
  for await (const file of glob.scan({ absolute: true, cwd: path })) {
    api.log.info(`✅ found ${file}`);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = (require(file) as { default: MessageHandler }).default;

    switch (module.eventName) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case "new_message":
        dp.onNewMessage(module.checker, (update) => {
          module.handler(update, api);
        });
        break;
      default:
        api.log.warning(`‼️ Found unknown event type ${module.eventName as string}`);
    }
  }
}

export async function importModules(dp: Dispatcher, api: Api) {
  const pathes = (process.env.MODULES_PATH ?? "./modules").split(";");
  const promises = [];
  for (const path of pathes) {
    promises.push(importFromPath(dp, api, path));
  }
  await Promise.all(promises);
}
