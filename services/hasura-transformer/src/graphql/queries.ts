import { gql } from 'apollo-server'

export const INTROSPECT_QUERY = gql`
  query InstrospecQuery {
    __type(name: "query_root") {
      fields {
        name
        args {
          name
        }
        type {
          name
        }
      }
    }
  }
`
