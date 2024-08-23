import { Glob } from "bun";
import type { Dispatcher } from '@mtcute/dispatcher'
import type { Api } from '@/api/types'

export const importModules = async (dp: Dispatcher, api: Api) => {
  const pathes = (process.env.MODULES_PATH ?? './modules').split(';')
  const glob = new Glob('**.ts')
  for (const path of pathes) {
    
    for await (const file of glob.scan({ cwd: path, absolute: true })) {
      api.log.info(`✅ found ${file}`)
      const module = require(file).default

      if (module.event_name !== 'new_message') {
        continue // TODO: logging
      }
      dp.onNewMessage(module.checker, (update) => module.handler(update, api))

    }
  }
}
