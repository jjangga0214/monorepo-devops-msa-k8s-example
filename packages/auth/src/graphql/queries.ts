import { gql } from 'apollo-server'

export const FIND_USER_BY_USERNAME = gql`
  query FindUser($username: String!) {
    user(where: { username: { _eq: $username } }) {
      id
      password
      role
    }
  }
`
