import cs from 'caller-callsite'

import { stableId } from './id.mjs'
import { registerWorkflow } from './router.mjs'

export const workflow = (fn) => {
  const id = stableId(cs())
  registerWorkflow(id, fn)

  return fn
}
