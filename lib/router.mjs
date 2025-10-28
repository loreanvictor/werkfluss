import { stringify, parse } from 'devalue'
import { StepPendingError } from './errors.mjs'
import { runWithContext } from './context.mjs'
import { logRunStarted, logRunCompleted, logStepStarted, logStepCompleted, getRunState, logRunPaused, logRunResumed, RUN_PAUSED } from './log.mjs'
import { on, emitRunComplete, emitStepComplete, emitRunResume,
  START_RUN, PAUSE_RUN, RESUME_RUN, COMPLETE_RUN, START_STEP, COMPLETE_STEP,
  emitRunPause
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
  runWithContext({ runId, workflowId, step: 0 }, () =>
    fn(...args)
      .then(result => emitRunComplete(workflowId, runId, result))
      .catch(err => {
        if (err instanceof StepPendingError) {
          emitRunPause(workflowId, runId, err.stepId, err.step)
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

on(PAUSE_RUN, ({ workflowId, runId, stepId, step }) => logRunPaused(workflowId, runId, stepId, step))

on(RESUME_RUN, ({ workflowId, runId, stepId, step }) => {
  const { started, completed, pauses} = getRunState({ runId, workflowId })

  if (!completed && started && pauses[pauses.length - 1]?.type === RUN_PAUSED) {
    logRunResumed(workflowId, runId, stepId, step)
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
