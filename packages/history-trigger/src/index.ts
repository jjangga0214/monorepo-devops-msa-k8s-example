import { connect, TodoHistory } from '@jjangga0214/history-db'
import express from 'express'

connect()
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(
  process.env.PORT || process.env.HISTORY_TRIGGER_ENDPORINT_PORT || 8080,
)
