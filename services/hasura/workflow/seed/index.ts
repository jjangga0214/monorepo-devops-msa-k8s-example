import { requestToHasura } from '@jjangga0214/communication'
// eslint-disable-next-line import/no-extraneous-dependencies
import { hash } from 'bcryptjs'
import faker from 'faker'
import { CREATE_USER } from './mutations'

faker.seed(123) // This ensures data's sequence.

async function main() {
  await requestToHasura(CREATE_USER, {
    objects: [
      {
        id: faker.random.uuid(),
        username: 'hello',
        password: await hash('foo', 10),
        role: 'ADMIN',
      },
      {
        id: faker.random.uuid(),
        username: 'hello2',
        password: await hash('bar', 10),
        role: 'USER',
      },
    ],
  })
}

main().then(() => {
  console.log('seed is inserted.')
})
