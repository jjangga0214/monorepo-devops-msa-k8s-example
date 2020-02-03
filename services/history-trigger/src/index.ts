import { connect, TodoHistory } from '@jjangga0214/history-db'
import express from 'express'
import { AddressInfo } from 'net'

connect()
const app = express()

app.use(express.json())

interface EventTriggerPayload {
  id: string
  created_at: Date
  event: {
    op: string
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      old: { [key: string]: any }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new: { [key: string]: any }
    }
  }
}

function save(body, cb: () => void): void {
  const {
    id,
    created_at,
    event: { op, data },
  } = body as EventTriggerPayload
  const todoHistory = new TodoHistory({
    ...(op === 'DELETE' ? data.old : data.new),
    _event: {
      id,
      created_at,
      operation: op,
    },
  })
  todoHistory.save().then(cb)
}

app.post('/', ({ body }, res) => {
  save(body, () => {
    res.status(200).send({
      result: 'success',
      created_at: new Date().toISOString(),
    })
  })
})

const server = app.listen(
  process.env.PORT || process.env.HISTORY_TRIGGER_ENDPOINT_PORT || 8080,
  () => {
    const { address, port } = server.address() as AddressInfo
    console.log(`Server running at ${address}:${port}`)
  },
)
