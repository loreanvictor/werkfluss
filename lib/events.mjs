import { EventEmitter } from 'node:events'

const emitter = new EventEmitter()

export const START_STEP = 'step:start'
export const COMPLETE_STEP = 'step:complete'
export const START_RUN = 'run:start'
export const PAUSE_RUN = 'run:pause'
export const RESUME_RUN = 'run:resume'
export const COMPLETE_RUN = 'run:complete'

export const emit = (type, details) => {
  emitter.emit(type, details)
}

export const emitStepStart = (workflowId, runId, stepId, step, args) => {
  emit(START_STEP, { runId, workflowId, stepId, step, args })
}

export const emitStepComplete = (workflowId, runId, stepId, step, result) => {
  emit(COMPLETE_STEP, { runId, workflowId, stepId, step, result })
}

export const emitRunStart = (workflowId, runId, args) => {
  emit(START_RUN, { runId, workflowId, args })
}

export const emitRunPause = (workflowId, runId, stepId, step) => {
  emit(PAUSE_RUN, { runId, workflowId, stepId, step })
}

export const emitRunResume = (workflowId, runId, stepId, step) => {
  emit(RESUME_RUN, { runId, workflowId, stepId, step })
}

export const emitRunComplete = (workflowId, runId, result) => {
  emit(COMPLETE_RUN, { runId, workflowId, result })
}

export const on = (type, listener) => {
  emitter.on(type, listener)
}

export const onRunStart = (workflowId, runId, listener) => {
  emitter.on(START_RUN, (event) => {
    if (event.runId === runId && event.workflowId === workflowId) {
      listener(event)
    }
  })
}

export const onRunComplete = (workflowId, runId, listener) => {
  emitter.on(COMPLETE_RUN, (event) => {
    if (event.runId === runId && event.workflowId === workflowId) {
      listener(event)
    }
  })
}

export const onStepStart = (workflowId, runId, stepId, step, listener) => {
  emitter.on(START_STEP, (event) => {
    if (event.runId === runId &&
        event.workflowId === workflowId &&
        event.stepId === stepId &&
        event.step === step) {
      listener(event)
    }
  })
}

export const onStepComplete = (workflowId, runId, stepId, step, listener) => {
  emitter.on(COMPLETE_STEP, (event) => {
    if (event.runId === runId &&
        event.workflowId === workflowId &&
        event.stepId === stepId &&
        event.step === step) {
      listener(event)
    }
  })
}
