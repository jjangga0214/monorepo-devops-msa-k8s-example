/**
 * mongoose.Types.ObjectId is `type` for typescript interface
 * mongoose.Schema.Types.ObjectId is `value` for schema object
 */
import {
  Document,
  Model,
  model,
  Schema,
  connect as _connect,
  set,
} from 'mongoose'

export async function connect() {
  set('debug', process.env.NODE_ENV !== 'production')

  await _connect(
    // access to admin database (See the end of this line)
    `${process.env.HISTORY_MONGO_ENDPOINT_SCHEME}://${process.env.HISTORY_MONGO_USERNAME}:${process.env.HISTORY_MONGO_PASSWORD}@${process.env.HISTORY_MONGO_ENDPOINT_IP}:${process.env.HISTORY_MONGO_ENDPOINT_PORT}/admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.HISTORY_MONGO_DATABASE,
    },
  )
  console.log('mongodb is connected')
}

interface Event extends Document {
  id: string
  created_at: Date
  operation: string
}

const eventSchema = new Schema({
  id: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  operation: String,
})

interface TodoHistory extends Document {
  id: string
  title: string
  status: string
  created_at: Date
  updated_at: Date
  _event: Event
}

const todoHistorySchema = new Schema({
  id: String,
  title: String,
  status: String,
  created_at: Date,
  updated_at: Date,
  _event: eventSchema,
})

export const TodoHistory: Model<TodoHistory> = model<TodoHistory>(
  'TodoHistory',
  todoHistorySchema,
)
