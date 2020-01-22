import message from '~api/message'

describe('message', () => {
  it('message', () => {
    expect.hasAssertions()
    expect(message()).toStrictEqual('hello world')
  })
})
