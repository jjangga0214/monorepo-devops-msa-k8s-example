import { connect, TodoHistory } from '@jjangga0214/history-db'

connect()

async function main() {
  connect()
  const todoHistory = new TodoHistory({
    id: 'idid2',
    content: 'Hello',
  })
  await todoHistory.save()
  console.log(todoHistory.id)
  console.log(await TodoHistory.find({}))
}

main()
