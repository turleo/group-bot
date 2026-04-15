import type { Dispatcher } from "@mtcute/dispatcher";
import { Glob } from "bun";

import type { Api } from "@/api/types";

async function importFromPath(api: Api, path: string) {
  const glob = new Glob("*.ts");
  const modulesDispatchers = [];
  for await (const file of glob.scan({ absolute: true, cwd: path })) {
    api.log.info(`found ${file}`);
    const module = (await import(file) as { init: (api: Api) => Dispatcher }).init;
    modulesDispatchers.push(module(api));
  }
  return modulesDispatchers;
}

export async function importModules(dp: Dispatcher, api: Api) {
  const pathes = (process.env.MODULES_PATH ?? "./modules").split(";");
  const promises = [];
  for (const path of pathes) {
    promises.push(importFromPath(api, path));
  }
  const modulesDispatchers = (await Promise.all(promises)).flat();
  for (const modulesDispatcher of modulesDispatchers) {
    dp.addChild(modulesDispatcher);
  }
}
