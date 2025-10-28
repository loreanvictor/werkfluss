import { uniqueId } from './id.mjs'
import { emitRunStart, onRunComplete } from './events.mjs'


export const start = (workflow, ...args) => {
  const runId = uniqueId()

  return new Promise((resolve, reject) => {
    emitRunStart(workflow.id, runId, args)
      onRunComplete(workflow.id, runId, ({ result }) => {
        resolve(result)
    })
  })
}
