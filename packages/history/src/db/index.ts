/**
 * mongoose.Types.ObjectId is `type` for typescript interface
 * mongoose.Schema.Types.ObjectId is `value` for schema object
 */
import { Document, Model, model, Schema, connect as _connect } from 'mongoose'

export async function connect() {
  await _connect(
    // access to admin database (See the end of this line)
    `${process.env.HISTORY_MONGO_ENDPOINT_PROTOCOL}://${process.env.HISTORY_MONGO_USERNAME}:${process.env.HISTORY_MONGO_PASSWORD}@${process.env.HISTORY_MONGO_ENDPOINT_IP}:${process.env.HISTORY_MONGO_ENDPOINT_PORT}/admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.HISTORY_MONGO_DATABASE,
    },
  )
  console.log('database is connected')
}

interface TodoHistory extends Document {
  id: string
  content: string
}

const todoHistorySchema = new Schema({
  id: String,
  content: String,
})

export const TodoHistory: Model<TodoHistory> = model<TodoHistory>(
  'TodoHistory',
  todoHistorySchema,
)
