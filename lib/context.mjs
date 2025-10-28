import { AsyncLocalStorage } from 'node:async_hooks'
import { OutOfContextExecutionError } from './errors.mjs'

export const workflowContext = new AsyncLocalStorage()

export const getContext = () => {
  const ctx = workflowContext.getStore()
  if (!ctx) {
    throw new OutOfContextExecutionError()
  }

  return ctx
}

export const getRunId = () => {
  return getContext().runId
}

export const getWorkflowId = () => {
  return getContext().workflowId
}

export const runWithContext = (context, fn) => {
  return workflowContext.run(context, fn)
}
