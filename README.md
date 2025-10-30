# werkfluss

an experiment to see how [vercel workflows](https://useworkflow.dev) would look like
without magical directives. turns out, like this:

```js
import { step, workflow, start, hook, sleep } from 'werkfluss'

const fetchDataForUser = step(async (userId) => { ... })
const saveSomethingToDb = step(async (data) => { ... })
const sendSomeEmail = step(async (data) => { ... })
const revokeSomething = step(async (data) => { ... })

const myWorkflow = workflow(async (userId) => {
  const data = await fetchDataForUser(userId)
  const userAcceptHook = hook()

  await saveSomethingToDb(data)
  await sendSomeEmail(data, userAcceptHook.id)

  let accepted = await Promise.race([
    sleep('1 day'),
    useAcceptHook.once(),
  ])

  if (!accepted) {
    await revokeSomething(data)
  }

  return 'done'
})

start(myWorkflow, 'user-123')
```

while this is a mock-up, to be able to deduce the correct interface, interfaces similar to what would
be needed in real world are implemented: requests are routed through an event system, prior runs are logged
into an event log for future cache / state updates, even the `sleep()` method is implemented via passing
messages to a (potentially external) job scheduler.

as can be seen above, an ergonomic API is possible without some of the hassles that are mentioned
[here by vercel](https://useworkflow.dev/docs/how-it-works/understanding-directives). it uses stable
identifiers for steps and workflows by relying on callsites, to afford the same resumability and separability
of execution (the runtimes for client, workflow and step functions can be easily separated). this also requires
no build steps, compiler configration, or special considerations for different frameworks.

on the other hand, three issues remain:

- directives are clearly and explicitly not composable. functions like `step()` and `workflow()` in this implementation can't be composed like normal functions due to their reliance on callsites. composability can be allowed, but it would still need to be more constrained than normal function composition, without any explicit syntax identifiers for this.
- similarly, workflows need to be more constrained to remain idempotent and deterministic, without any explicit syntax indicators or compile-time checks on the matter. this of course could be mitigated by separating workflow runtime and imposing limitations on that layer.
- error-handling gets broken, since _pausing_ a workflow in this impl. comes down to breaking execution flow with a _Pending_ error (either a step or a hook), which ideally is resolved on future resumptions (reruns of the workflow). this can also be mitigated by shifting responsibility for pausing the workflow to the runtime itself and not pausing the workflow after every step (or on waiting for every hook), though I do personally prefer the more explicit execution model instead of relying on the runtime.

## Running

clone the repo, and run the following. you need NPM 23 or higher.

```bash
npm install
npm start
```

the example workflow is in `index.mjs`, so you can play with it to test different scenarios.

<br><br>