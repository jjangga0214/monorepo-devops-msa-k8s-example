// eslint-disable-next-line import/no-extraneous-dependencies
import gql from 'graphql-tag'

export const CREATE_USER = gql`
  mutation CreateUser($objects: [user_insert_input!]!) {
    insert_user(objects: $objects) {
      returning {
        id
        password
      }
    }
  }
`
