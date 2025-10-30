import delay from 'sleep-promise'
import { step, workflow, hook, invokeHook, start, sleep } from './lib.mjs'
import { logs } from './lib/log.mjs'

const a = step(async (i) => { console.log(`AAA: ${i}`) })
const b = step(async () => { console.log('BBB') })
const c = step(async () => { await delay(400); console.log('CCC'); return 2 })

let hi

const wf = workflow(async (i) => {
  const h = hook()
  hi = h.id

  await a(1)
  await b()

  const j = await Promise.race([
    c(),
    h.once(),
    sleep('400ms'),
  ])

  return i * 42 + j
})

start(wf, 1).then(console.log).catch(console.error)

setTimeout(() => invokeHook(hi, 42), 600)
setTimeout(() => console.log(logs()), 1000)
