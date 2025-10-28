import sleep from 'sleep-promise'
import { step, workflow, start } from './lib.mjs'
import { logs } from './lib/log.mjs'

const a = step(async (i) => { console.log(`AAA: ${i}`) })
const b = step(async () => { console.log('BBB') })
const c = step(async () => { await sleep(100); console.log('CCC') })

const wf = workflow(async (i) => {
  await a(1)
  await b()
  await Promise.race([
    a(i + 3),
    c(),
  ])

  return i * 42
})

start(wf, 1).then(console.log).catch(console.error)

setTimeout(() => console.log(logs()), 1000)
