# werkfluss

an experiment to see how vercel workflows would look like without magical directives. turns out, like this:

```js
import { step, workflow, start } from 'werkfluss'

const fetchDataForUser = step(async (userId) => { ... })
const saveSomethingToDb = step(async (data) => { ... })
const sendSomeEmail = step(async (data) => { ... })

const myWorkflow = workflow(async (userId) => {
  const data = await fetchDataForUser(userId)

  await saveSomethingToDb(data)
  await sendSomeEmail(data)

  return 'done'
})

start(myWorkflow, 'user-123')
```

this repo doesn't handle errors properly, deosn't retry, doesn't have hooks (yet, I think it'd be fun to rewrite the whole thing
with hooks instead of steps), etc. but I've tried to keep the situation similar to what a real workflow engine would look like,
with an event log that can be persisted, and an event queue for routing messages and ensuring delivery.

the key aspect here is resumability of the workflow: each run of the workflow has a unique Id, and each step execution
is logged with serialised input and output, so on reruns, steps don't actually re-execute and just provide the data from cache, meaning
only steps that haven't executed yet will run.

this means we can freely pause and resume workflows assuming the workflow itself doesn't have side effects and is deterministic. so basically for each step we pause the workflow and after each step is done we resume it (if it was paused).

this looks quite ergonomic to me, without many of the issues cited by vercel team for why they decided to use directives. two
arguments remain in favor of directives though:

- if you don't want to trust devs to keep the workflow deterministic and side-effect free, directives and bundling enforce separating the runtime and isolating it, stopping some potential errors,
- directives can't be composed. the `step()` and `workflow()` functions here do use callsite information to generate stable Ids, which means they are also not to be composed. but unlike directives, nothing is stopping anyone from not composing them except asking nicely.

## Running

clone the repo, and run the following. you need NPM 23 or higher.

```bash
npm install
npm start
```

the example workflow is in `index.mjs`, so you can play with it to test different scenarios.

<br><br>