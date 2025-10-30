import cs from 'caller-callsite'
import sleep from 'sleep-promise'
import { parse } from 'devalue'

import { StepPendingError } from './errors.mjs'
import { registerStep } from './router.mjs'
import { getContext } from './context.mjs'
import { stableId } from './id.mjs'
import { getStepState } from './log.mjs'
import { emitStepStart } from './events.mjs'


export const step = (fn) => {
  const id = stableId(cs())
  registerStep(id, fn)

  return async (...args) => {
    const context = getContext()
    const step = (context.step += 1)
    const { workflowId, runId } = context
    const { started, completed } = getStepState(id, step)

    if (completed) {
      return parse(completed.details.result)
    } else if (started) {
      await sleep(0)
      throw new StepPendingError(id, step)
    } else {
      await sleep(0)
      emitStepStart(workflowId, runId, id, step, args)
      throw new StepPendingError(id, step)
    }
  }
}
