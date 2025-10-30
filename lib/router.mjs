import { stringify, parse } from 'devalue'

import { isPendingError } from './errors.mjs'
import { runWithContext } from './context.mjs'
import { logRunStarted, logRunCompleted, logStepStarted, logStepCompleted, getRunState, logRunPaused, logRunResumed, RUN_PAUSED, logHookBound, logHookInvoked, getHookState } from './log.mjs'
import { on, emitRunComplete, emitStepComplete, emitRunResume,
  START_RUN, PAUSE_RUN, RESUME_RUN, COMPLETE_RUN, START_STEP, COMPLETE_STEP,
  emitRunPause,
  INVOKE_HOOK,
  BIND_HOOK
} from './events.mjs'

const stepRegistry = new Map()
const workflowRegistry = new Map()

export const registerStep = (id, fn) => {
  fn.id = id
  stepRegistry.set(id, fn)
}

export const registerWorkflow = (id, fn) => {
  fn.id = id
  workflowRegistry.set(id, fn)
}

const runWorkflow = (workflowId, runId, args) => {
  const fn = workflowRegistry.get(workflowId)
  runWithContext({ runId, workflowId, step: 0, hook: 0 }, () =>
    fn(...args)
      .then(result => emitRunComplete(workflowId, runId, result))
      .catch(err => {
        if (isPendingError(err)) {
          emitRunPause(workflowId, runId)
        } else {
          // TODO: this should be emitted somewhere
          throw err
        }
      })
  )
}

on(START_RUN, ({ workflowId, runId, args }) => {
  logRunStarted(workflowId, runId, stringify(args))
  runWorkflow(workflowId, runId, args)
})

on(PAUSE_RUN, ({ workflowId, runId }) => logRunPaused(workflowId, runId))

on(RESUME_RUN, ({ workflowId, runId }) => {
  const { started, completed, pauses} = getRunState({ runId, workflowId })

  if (!completed && started && pauses[pauses.length - 1]?.type === RUN_PAUSED) {
    logRunResumed(workflowId, runId)
    runWorkflow(workflowId, runId, parse(started.details.args))
  }
})

on(COMPLETE_RUN, ({ workflowId, runId, result }) => logRunCompleted(workflowId, runId, stringify(result)))

on(START_STEP, ({ workflowId, runId, stepId, step, args }) => {
  const fn = stepRegistry.get(stepId)
  logStepStarted(workflowId, runId, stepId, step, stringify(args))

  setImmediate(() => {
    fn(...args)
      .then(result => emitStepComplete(workflowId, runId, stepId, step, result))
      .catch(err => {
        // TODO: maybe retry?
        // TODO: also this should be emitted somewhere
        throw err
      })
  })
})

on(COMPLETE_STEP, ({ workflowId, runId, stepId, step, result }) => {
  logStepCompleted(workflowId, runId, stepId, step, stringify(result))
  emitRunResume(workflowId, runId, stepId, step)
})

on(BIND_HOOK, ({ workflowId, runId, hookId }) => {
  logHookBound(workflowId, runId, hookId)
})

on(INVOKE_HOOK, ({ hookId, value }) => {
  logHookInvoked(hookId, stringify(value))
  const { bound } = getHookState(hookId)

  bound.forEach(run => emitRunResume(run.workflowId, run.runId))
})
