import { getContext } from './context.mjs'

// TODO: this should be replaced with a more durable
//       form of persistance.

export const STEP_STARTED = 'step:started'
export const STEP_COMPLETED = 'step:completed'
export const HOOK_BOUND = 'hook:bound'
export const HOOK_INVOKED = 'hook:invoked'
export const RUN_STARTED = 'run:started'
export const RUN_PAUSED = 'run:paused'
export const RUN_RESUMED = 'run:resumed'
export const RUN_COMPLETED = 'run:completed'
// TODO: add error event types

const eventlog = []

export const logs = () => eventlog

export const getLogs = (ctx) => {
  const { workflowId, runId } = ctx ?? getContext()

  return eventlog.filter(log => log.workflowId === workflowId && log.runId === runId)
}

export const log = (workflowId, runId, type, details) => {
  eventlog.push({
    runId,
    workflowId,
    timestamp: Date.now(),
    type,
    details: details ?? {},
  })
}

export const logStepStarted = (workflowId, runId, stepId, step, args) => {
  log(workflowId, runId, STEP_STARTED, { stepId, step, args })
}

export const logStepCompleted = (workflowId, runId, stepId, step, result) => {
  log(workflowId, runId, STEP_COMPLETED, { stepId, step, result })
}

export const getStepState = (id, step) => {
  const logs = getLogs()

  const started = logs.find(
    (log) => log.details.stepId === id && log.details.step === step && log.type === STEP_STARTED)
  const completed = logs.find(
    (log) => log.details.stepId === id && log.details.step === step && log.type === STEP_COMPLETED)

  return { started, completed }
}

export const logHookBound = (workflowId, runId, hookId) => {
  log(workflowId, runId, HOOK_BOUND, { hookId })
}

export const logHookInvoked = (hookId, value) => {
  log(undefined, undefined, HOOK_INVOKED, { hookId, value })
}

export const getHookState = (id) => {
  const bound = eventlog.filter(
    (log) => log.details.hookId === id && log.type === HOOK_BOUND
  )
  const invocations = eventlog.filter(
    (log) => log.details.hookId === id && log.type === HOOK_INVOKED)

  return { bound, invocations }
}

export const logRunStarted = (workflowId, runId, args) => {
  log(workflowId, runId, RUN_STARTED, { args })
}

export const logRunPaused = (workflowId, runId) => {
  log(workflowId, runId, RUN_PAUSED)
}

export const logRunResumed = (workflowId, runId) => {
  log(workflowId, runId, RUN_RESUMED)
}

export const logRunCompleted = (workflowId, runId, result) => {
  log(workflowId, runId, RUN_COMPLETED, { result })
}

export const getRunState = (ctx) => {
  const logs = getLogs(ctx)

  const started = logs.find((log) => log.type === RUN_STARTED)
  const completed = logs.find((log) => log.type === RUN_COMPLETED)
  const pauses = logs.filter((log) => log.type === RUN_PAUSED || log.type === RUN_RESUMED)

  return { started, completed, pauses }
}
