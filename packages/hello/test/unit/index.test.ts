import hello from '~hello'

describe('hello', () => {
  it('hello world', () => {
    expect.hasAssertions()
    expect(hello('world')).toStrictEqual('hello world')
  })
})
