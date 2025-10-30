import sleep from 'sleep-promise'
import { parse } from 'devalue'

import { HookPendingError } from './errors.mjs'
import { emitHookBind, emitHookInvoke } from './events.mjs'
import { getContext } from './context.mjs'
import { getHookState } from './log.mjs'


export const hook = () => {
  const context = getContext()
  const { workflowId, runId } = context
  const hook = (context.hook += 1)
  const id = `hook-${workflowId}:${runId}:${hook}`
  const { invocations, bound } = getHookState(id)
  if (!bound.find((run) => run.runId === runId && run.workflowId === workflowId)) {
    emitHookBind(workflowId, runId, id)
  }

  const values = invocations[Symbol.iterator]()

  const ref = {
    id,
    [Symbol.asyncIterator]: () => ref,
    next: async () => {
      const { done, value: event } = values.next()
      if (done) {
        await sleep(0)
        throw new HookPendingError(id)
      } else {
        return { done, value: parse(event.details.value) }
      }
    },
    once: async () => {
      return (await ref.next()).value
    },
  }

  return ref
}


export const invokeHook = (id, value) => {
  emitHookInvoke(id, value)
}
