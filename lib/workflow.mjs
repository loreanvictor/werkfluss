import cs from 'caller-callsite'

import { stableId, uniqueId } from './id.mjs'
import { registerWorkflow } from './router.mjs'
import { emitRunStart, onRunComplete } from './events.mjs'

export const workflow = (fn) => {
  const workflowId = stableId(cs())
  registerWorkflow(workflowId, fn)

  return (...args) => {
    const runId = uniqueId()
  
    return new Promise((resolve, reject) => {
      emitRunStart(workflowId, runId, args)
      onRunComplete(workflowId, runId, ({ result }) => {
        resolve(result)
      })
    })
  }
}
