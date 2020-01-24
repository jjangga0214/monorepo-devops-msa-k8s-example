import { gql } from 'apollo-server'

export const GET_USER = gql`
  query GetUser($username: String!, $password: String!) {
    user(
      where: { username: { _eq: $username }, password: { _eq: $password } }
    ) {
      id
    }
  }
`
