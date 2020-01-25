const sdl = `
schema {
  query: query_root
  mutation: mutation_root
  subscription: subscription_root
}

extend type mutation_root {
  """
  delete data from the table: "user"
  """
  delete_user(
    """filter the rows which have to be deleted"""
    where: user_bool_exp!
  ): user_mutation_response
  """
  insert data into the table: "user"
  """
  insert_user(
    """the rows to be inserted"""
    objects: [user_insert_input!]!
    """on conflict condition"""
    on_conflict: user_on_conflict
  ): user_mutation_response
  """
  update data of the table: "user"
  """
  update_user(
    """sets the columns of the filtered rows to the given values"""
    _set: user_set_input
    """filter the rows which have to be updated"""
    where: user_bool_exp!
  ): user_mutation_response
}

"""column ordering options"""
enum order_by {
  """in the ascending order, nulls last"""
  asc
  """in the ascending order, nulls first"""
  asc_nulls_first
  """in the ascending order, nulls last"""
  asc_nulls_last
  """in the descending order, nulls first"""
  desc
  """in the descending order, nulls first"""
  desc_nulls_first
  """in the descending order, nulls last"""
  desc_nulls_last
}

extend type query_root {
  """
  fetch data from the table: "user"
  """
  user(
    """distinct select on columns"""
    distinct_on: [user_select_column!]
    """limit the number of rows returned"""
    limit: Int
    """skip the first n rows. Use only with order_by"""
    offset: Int
    """sort the rows by one or more columns"""
    order_by: [user_order_by!]
    """filter the rows returned"""
    where: user_bool_exp
  ): [user!]!
  """
  fetch aggregated fields from the table: "user"
  """
  user_aggregate(
    """distinct select on columns"""
    distinct_on: [user_select_column!]
    """limit the number of rows returned"""
    limit: Int
    """skip the first n rows. Use only with order_by"""
    offset: Int
    """sort the rows by one or more columns"""
    order_by: [user_order_by!]
    """filter the rows returned"""
    where: user_bool_exp
  ): user_aggregate!
  """fetch data from the table: "user" using primary key columns"""
  user_by_pk(id: uuid!): user
}

"""expression to compare columns of type String. All fields are combined with logical 'AND'."""
input String_comparison_exp {
  _eq: String
  _gt: String
  _gte: String
  _ilike: String
  _in: [String!]
  _is_null: Boolean
  _like: String
  _lt: String
  _lte: String
  _neq: String
  _nilike: String
  _nin: [String!]
  _nlike: String
  _nsimilar: String
  _similar: String
}

extend type subscription_root {
  """
  fetch data from the table: "user"
  """
  user(
    """distinct select on columns"""
    distinct_on: [user_select_column!]
    """limit the number of rows returned"""
    limit: Int
    """skip the first n rows. Use only with order_by"""
    offset: Int
    """sort the rows by one or more columns"""
    order_by: [user_order_by!]
    """filter the rows returned"""
    where: user_bool_exp
  ): [user!]!
  """
  fetch aggregated fields from the table: "user"
  """
  user_aggregate(
    """distinct select on columns"""
    distinct_on: [user_select_column!]
    """limit the number of rows returned"""
    limit: Int
    """skip the first n rows. Use only with order_by"""
    offset: Int
    """sort the rows by one or more columns"""
    order_by: [user_order_by!]
    """filter the rows returned"""
    where: user_bool_exp
  ): user_aggregate!
  """fetch data from the table: "user" using primary key columns"""
  user_by_pk(id: uuid!): user
}

scalar timestamptz

"""expression to compare columns of type timestamptz. All fields are combined with logical 'AND'."""
input timestamptz_comparison_exp {
  _eq: timestamptz
  _gt: timestamptz
  _gte: timestamptz
  _in: [timestamptz!]
  _is_null: Boolean
  _lt: timestamptz
  _lte: timestamptz
  _neq: timestamptz
  _nin: [timestamptz!]
}

extend type user @key(fields: "id") {
  created_at: timestamptz!
  id: uuid! @external
  password: String!
  updated_at: timestamptz!
  username: String!
}

"""
aggregated selection of "user"
"""
type user_aggregate {
  aggregate: user_aggregate_fields
  nodes: [user!]!
}

"""
aggregate fields of "user"
"""
type user_aggregate_fields {
  count(columns: [user_select_column!], distinct: Boolean): Int
  max: user_max_fields
  min: user_min_fields
}

"""
order by aggregate values of table "user"
"""
input user_aggregate_order_by {
  count: order_by
  max: user_max_order_by
  min: user_min_order_by
}

"""
input type for inserting array relation for remote table "user"
"""
input user_arr_rel_insert_input {
  data: [user_insert_input!]!
  on_conflict: user_on_conflict
}

"""Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'."""
input user_bool_exp {
  _and: [user_bool_exp]
  _not: user_bool_exp
  _or: [user_bool_exp]
  created_at: timestamptz_comparison_exp
  id: uuid_comparison_exp
  password: String_comparison_exp
  updated_at: timestamptz_comparison_exp
  username: String_comparison_exp
}

"""
unique or primary key constraints on table "user"
"""
enum user_constraint {
  """unique or primary key constraint"""
  user_pkey
  """unique or primary key constraint"""
  user_username_key
}

"""
input type for inserting data into table "user"
"""
input user_insert_input {
  created_at: timestamptz
  id: uuid
  password: String
  updated_at: timestamptz
  username: String
}

"""aggregate max on columns"""
type user_max_fields {
  created_at: timestamptz
  password: String
  updated_at: timestamptz
  username: String
}

"""
order by max() on columns of table "user"
"""
input user_max_order_by {
  created_at: order_by
  password: order_by
  updated_at: order_by
  username: order_by
}

"""aggregate min on columns"""
type user_min_fields {
  created_at: timestamptz
  password: String
  updated_at: timestamptz
  username: String
}

"""
order by min() on columns of table "user"
"""
input user_min_order_by {
  created_at: order_by
  password: order_by
  updated_at: order_by
  username: order_by
}

"""
response of any mutation on the table "user"
"""
type user_mutation_response {
  """number of affected rows by the mutation"""
  affected_rows: Int!
  """data of the affected rows by the mutation"""
  returning: [user!]!
}

"""
input type for inserting object relation for remote table "user"
"""
input user_obj_rel_insert_input {
  data: user_insert_input!
  on_conflict: user_on_conflict
}

"""
on conflict condition type for table "user"
"""
input user_on_conflict {
  constraint: user_constraint!
  update_columns: [user_update_column!]!
  where: user_bool_exp
}

"""
ordering options when selecting data from "user"
"""
input user_order_by {
  created_at: order_by
  id: order_by
  password: order_by
  updated_at: order_by
  username: order_by
}

"""
select columns of table "user"
"""
enum user_select_column {
  """column name"""
  created_at
  """column name"""
  id
  """column name"""
  password
  """column name"""
  updated_at
  """column name"""
  username
}

"""
input type for updating data in table "user"
"""
input user_set_input {
  created_at: timestamptz
  id: uuid
  password: String
  updated_at: timestamptz
  username: String
}

"""
update columns of table "user"
"""
enum user_update_column {
  """column name"""
  created_at
  """column name"""
  id
  """column name"""
  password
  """column name"""
  updated_at
  """column name"""
  username
}

scalar uuid

"""expression to compare columns of type uuid. All fields are combined with logical 'AND'."""
input uuid_comparison_exp {
  _eq: uuid
  _gt: uuid
  _gte: uuid
  _in: [uuid!]
  _is_null: Boolean
  _lt: uuid
  _lte: uuid
  _neq: uuid
  _nin: [uuid!]
}
`
