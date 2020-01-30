import { requestToHasura } from '@jjangga0214/communication'
// eslint-disable-next-line import/no-extraneous-dependencies
import { hash } from 'bcryptjs'
import { CREATE_USER } from './mutations'

async function main() {
  await requestToHasura(CREATE_USER, {
    objects: [
      {
        username: 'hello',
        password: await hash('foo', 10),
        role: 'ADMIN',
      },
      {
        username: 'hello2',
        password: await hash('bar', 10),
        role: 'USER',
      },
    ],
  })
}

main()
