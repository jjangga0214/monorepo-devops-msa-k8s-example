// real node-fetch types clash with apollo-link-http, so manually define it as globalfetch here.
declare module 'node-fetch' {
  const fetch: GlobalFetch['fetch']
  export default fetch
}
