import { getRunId, getWorkflowId } from './context.mjs'


export class StepPendingError extends Error {
  constructor(id, step) {
    super(`Step ${step} of run ${getRunId()} is still pending.`)
    this.name = 'StepPendingError'
    this.stepId = id
    this.step = step
    this.workflowId = getWorkflowId()
    this.runId = getRunId()
  }
}


export class HookPendingError extends Error {
  constructor(id) {
    super(`Hook ${id} of run ${getRunId()} is still pending.`)
    this.name = 'HookPendingError'
    this.hookId = id
    this.workflowId = getWorkflowId()
    this.runId = getRunId()
  }
}


export class OutOfContextExecutionError extends Error {
  constructor() {
    super('Function executed outside of workflow context.')
    this.name = 'OutOfContextExecutionError'
  }
}


export const isPendingError = (err) => {
  return (
    err instanceof StepPendingError
    || err instanceof HookPendingError
    || (
      err instanceof AggregateError &&
      !err.errors.some(e => !isPendingError(e))
    )
  )
}
