import ms from 'ms'

import { step } from './step.mjs'
import { hook, invokeHook } from './hook.mjs'

const timers = new Map()

const registerTimer = step(async (hookId, duration) => {
  const time = Date.now() + ms(duration)

  if (!timers.has(time)) {
    timers.set(time, [])
  }

  timers.get(time).push(hookId)
})

export const sleep = async duration => {
  const h = hook()
  await registerTimer(h.id, duration)

  return h.once()
}

setInterval(() => {
  const now = Date.now()

  timers.forEach((hooks, time) => {
    if (time <= now) {
      timers.delete(time)
      hooks.forEach(h => invokeHook(h))
    }
  })
}, 50)
