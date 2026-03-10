/**
 * Test client for the auto-responder feature.
 *
 * Usage:
 *   1. Start the server:  npm run dev -- -i examples/auto-responder/db.json
 *   2. Run this client:   node examples/auto-responder/test-client.mjs
 *
 * This script connects to the WS server and sends a series of messages
 * to exercise each auto-response rule, then prints the responses.
 */

import WebSocket from 'ws'

const PORT = process.argv[2] || 9704

const testCases = [
  {
    label: '1. Exact match: ping → pong',
    path: '/',
    message: 'ping'
  },
  {
    label: '2. Contains match: echo',
    path: '/',
    message: 'echo: hello world!'
  },
  {
    label: '3. JSONPath: subscribe to a channel',
    path: '/',
    message: JSON.stringify({ type: 'subscribe', channel: 'live-scores' })
  },
  {
    label: '4. JSONPath: auth request',
    path: '/',
    message: JSON.stringify({ type: 'auth', username: 'admin', password: 'secret' })
  },
  {
    label: '5. JSONPath with path filter: chat message (on /chat)',
    path: '/chat',
    message: JSON.stringify({ type: 'message', text: 'Hello everyone!' })
  },
  {
    label: '6. Delayed response: search query (1.5s delay)',
    path: '/',
    message: JSON.stringify({ type: 'search', query: 'websocket mock' })
  },
  {
    label: '7. Regex match: error trigger',
    path: '/',
    message: 'error something went wrong'
  },
  {
    label: '8. Regex match: heartbeat',
    path: '/',
    message: JSON.stringify({ type: 'heartbeat' })
  },
  {
    label: '9. No match: should get no auto-response',
    path: '/',
    message: 'this will not match any rule'
  }
]

async function runTest(testCase) {
  return new Promise((resolve) => {
    const url = `ws://localhost:${PORT}${testCase.path}`
    const ws = new WebSocket(url)
    let gotResponse = false
    const responses = []

    ws.on('open', () => {
      console.log(`\n--- ${testCase.label} ---`)
      console.log(`  → Sending: ${testCase.message}`)

      // Skip initial data message
      let initialReceived = false
      ws.on('message', (data) => {
        if (!initialReceived) {
          initialReceived = true
          // Now send the test message
          ws.send(testCase.message)
          return
        }
        gotResponse = true
        const parsed = JSON.parse(data.toString())
        console.log(`  ← Response: ${JSON.stringify(parsed, null, 2)}`)
        responses.push(parsed)
        ws.close()
      })

      // Timeout for cases with no response or delayed responses
      setTimeout(() => {
        if (!gotResponse) {
          console.log('  ← No auto-response received (as expected for unmatched messages)')
          ws.close()
        }
      }, 3000)
    })

    ws.on('close', () => resolve(responses))
    ws.on('error', (err) => {
      console.error(`  ✗ Connection error: ${err.message}`)
      resolve([])
    })
  })
}

async function main() {
  console.log('=== Auto-Responder Test Client ===')
  console.log(`Connecting to ws://localhost:${PORT}\n`)

  for (const testCase of testCases) {
    await runTest(testCase)
  }

  console.log('\n=== All tests completed ===')
  process.exit(0)
}

main()
