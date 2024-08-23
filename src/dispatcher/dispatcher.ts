import { Glob } from "bun";
import type { Dispatcher } from '@mtcute/dispatcher'
import type { Api } from '@/api/types'

export const importModules = async (dp: Dispatcher, api: Api) => {
  if (typeof process.env.MODULES_PATH !== 'string') {
    throw new TypeError()
  }
  const pathes = process.env.MODULES_PATH.split(';')
  const glob = new Glob('**.ts')
  for (const path of pathes) {
    
    for await (const file of glob.scan(path)) {
      console.log(file)
      const module = require(`${path}/${file}`).default

      if (module.event_name !== 'new_message') {
        continue // TODO: logging
      }
      dp.onNewMessage(module.checker, (update) => module.handler(update, api))

    }
  }
}
