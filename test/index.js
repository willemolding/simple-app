// This test file uses the tape testing framework.
// To learn more, go here: https://github.com/substack/tape
const test = require('tape');

const { ConfigBuilder, Container } = require("../../holochain-rust/nodejs_container")

//const dnaPath = "./dist/app_spec.hcpkg"
const dnaPath = "./dist/bundle.json"

// IIFE to keep config-only stuff out of test scope
const config = (() => {
  const agentAlice = ConfigBuilder.agent("alice")

  const dna = ConfigBuilder.dna(dnaPath)

  const instanceAlice = ConfigBuilder.instance(agentAlice, dna)

  return ConfigBuilder.container(instanceAlice)
})()

// Initialize the Container
const container = new Container(config)
container.start()

// This function is a bit of temporary boilerplate to construct a convenient object
// for testing. These objects will be created automatically with the new Scenario API,
// and then this function will go away. (TODO)
const makeCaller = (agentId) => {
  const instanceId = agentId + '-' + dnaPath
  return {
    call: (zome, cap, fn, params) => container.call(instanceId, zome, cap, fn, params),
    agentId: container.agent_id(instanceId)
  }
}

const app = makeCaller('alice')

test('description of example test', (t) => {
  // Make a call to a Zome function
  // indicating the capability and function, and passing it an input
    const addr = app.call("simple", "main", "share_item", {"item" : {"content":"sample content"}})

    const result = app.call("simple", "main", "get_item", {"address": addr.Ok})

  // check for equality of the actual and expected results
  t.deepEqual(result, { Ok: { App: [ 'item', '{"content":"sample content"}' ] } })

  // ends this test
  t.end()
})
